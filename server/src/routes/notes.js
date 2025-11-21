const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

const router = express.Router();

router.use(auth);

const simplifyUser = (user) => {
  if (!user) return null;

  if (typeof user === 'object' && user.username) {
    return {
      id: (user._id || user.id).toString(),
      username: user.username,
      email: user.email,
    };
  }

  const id = user._id || user.id || user;
  return { id: id?.toString() };
};

const formatNote = (note) => ({
  id: note._id?.toString(),
  sender: simplifyUser(note.sender),
  recipient: simplifyUser(note.recipient),
  content: note.content,
  status: note.status,
  deliveredAt: note.deliveredAt,
  readAt: note.readAt,
  expiresAt: note.expiresAt,
});

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

router.get('/inbox', async (req, res) => {
  const notes = await Note.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate('sender', 'username email')
    .lean();

  return res.json({ notes: notes.map(formatNote) });
});

router.get('/outbox', async (req, res) => {
  const notes = await Note.find({ sender: req.user._id })
    .sort({ createdAt: -1 })
    .populate('recipient', 'username email')
    .lean();

  return res.json({ notes: notes.map(formatNote) });
});

router.post(
  '/',
  [
    body('recipientId').isString().withMessage('Recipient is required'),
    body('content')
      .isLength({ min: 1, max: 300 })
      .withMessage('Content must be between 1 and 300 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, content } = req.body;

    if (!isValidObjectId(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (!req.user.friends.some((friendId) => friendId.equals(recipient._id))) {
      return res.status(403).json({ message: 'Recipient is not your friend' });
    }

    const note = await Note.create({
      sender: req.user._id,
      recipient: recipient._id,
      content,
    });

    await note.populate([
      { path: 'sender', select: 'username email' },
      { path: 'recipient', select: 'username email' },
    ]);

    const payload = formatNote(note);

    notificationService.send(recipient._id.toString(), 'note', payload);

    return res.status(201).json({ message: 'Note sent', note: payload });
  }
);

router.post('/:id/read', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid note id' });
  }

  const note = await Note.findOne({ _id: id, recipient: req.user._id });
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (note.status === 'read') {
    return res.json({ message: 'Note already read' });
  }

  note.status = 'read';
  note.readAt = new Date();
  await note.save();

  notificationService.send(note.sender.toString(), 'note-status', {
    noteId: note._id.toString(),
    status: 'read',
  });

  return res.json({ message: 'Note marked as read' });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid note id' });
  }

  const note = await Note.findOneAndDelete({ _id: id, recipient: req.user._id });

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  return res.json({ message: 'Note deleted' });
});

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders?.();
  res.write('event: connected\n');
  res.write('data: {}\n\n');

  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });

  notificationService.addConnection(req.user._id.toString(), res);
});

module.exports = router;
