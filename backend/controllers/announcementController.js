const Announcement = require('../models/Announcement');

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const query = {};
    
    if (req.user && req.user.role) {
      query.targetAudience = { $in: [req.user.role, 'all'] };
    }
    
    if (req.query.showAll !== 'true') {
      query.isActive = true;
    }
    
    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'name role');
      
    res.json(announcements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name role');
      
    if (!announcement) {
      return res.status(404).json({ msg: 'Announcement not found' });
    }
    
    res.json(announcement);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Announcement not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  const { title, content, targetAudience, attachments } = req.body;
  
  try {
    const newAnnouncement = new Announcement({
      title,
      content,
      author: req.user.id,
      targetAudience,
      attachments
    });
    
    const announcement = await newAnnouncement.save();
    
    res.json(announcement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update an announcement
exports.updateAnnouncement = async (req, res) => {
  const { title, content, targetAudience, attachments, isActive } = req.body;
  
  try {
    let announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ msg: 'Announcement not found' });
    }
    
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'tpo') {
      return res.status(401).json({ msg: 'Not authorized to update this announcement' });
    }
    
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (targetAudience) announcement.targetAudience = targetAudience;
    if (attachments) announcement.attachments = attachments;
    if (isActive !== undefined) announcement.isActive = isActive;
    
    announcement = await announcement.save();
    
    res.json(announcement);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Announcement not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ msg: 'Announcement not found' });
    }
    
    if (announcement.author.toString() !== req.user.id && req.user.role !== 'tpo') {
      return res.status(401).json({ msg: 'Not authorized to delete this announcement' });
    }
    
    await announcement.deleteOne();
    
    res.json({ msg: 'Announcement deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Announcement not found' });
    }
    res.status(500).send('Server Error');
  }
};
