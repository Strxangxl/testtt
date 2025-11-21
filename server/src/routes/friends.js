const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const friends = await User.find({ _id: { $in: req.user.friends } })
    .select('username email')
    .lean();

  return res.json({ friends });
});

router.get('/requests', async (req, res) => {
  const incoming = await FriendRequest.find({ recipient: req.user._id, status: 'pending' })
    .populate('requester', 'username email')
    .lean();

  const outgoing = await FriendRequest.find({ requester: req.user._id, status: 'pending' })
    .populate('recipient', 'username email')
    .lean();

  return res.json({ incoming, outgoing });
});

router.post(
  '/request',
  [body('username').isString().withMessage('Username is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    if (req.user.username === username.toLowerCase()) {
      return res.status(400).json({ message: 'You cannot add yourself' });
    }

    const recipient = await User.findOne({ username: username.toLowerCase() });

    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.friends.some((friendId) => friendId.equals(recipient._id))) {
      return res.status(400).json({ message: 'Already friends' });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { requester: req.user._id, recipient: recipient._id },
        { requester: recipient._id, recipient: req.user._id },
      ],
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already pending' });
    }

    const request = await FriendRequest.create({
      requester: req.user._id,
      recipient: recipient._id,
    });

    return res.status(201).json({
      message: 'Friend request sent',
      request,
    });
  }
);

router.post(
  '/respond',
  [
    body('requestId').isString().withMessage('Request ID is required'),
    body('action').isIn(['accept', 'reject']).withMessage('Invalid action'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { requestId, action } = req.body;

    const request = await FriendRequest.findById(requestId);

    if (!request || !request.recipient.equals(req.user._id)) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request already resolved' });
    }

    if (action === 'reject') {
      request.status = 'rejected';
      await request.deleteOne();
      return res.json({ message: 'Friend request rejected' });
    }

    const requester = await User.findById(request.requester);
    const recipient = await User.findById(request.recipient);

    if (!requester || !recipient) {
      return res.status(404).json({ message: 'Users involved no longer exist' });
    }

    if (!requester.friends.some((friendId) => friendId.equals(recipient._id))) {
      requester.friends.push(recipient._id);
      await requester.save();
    }

    if (!recipient.friends.some((friendId) => friendId.equals(requester._id))) {
      recipient.friends.push(requester._id);
      await recipient.save();
    }

    await request.deleteOne();

    const friends = await User.find({ _id: { $in: recipient.friends } })
      .select('username email')
      .lean();

    return res.json({ message: 'Friend request accepted', friends });
  }
);

module.exports = router;
