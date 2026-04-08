const Profile = require('../models/profileModel');
const upload = require('../config/multerConfig');
const path = require('path');
const fs = require('fs'); // Added because setDp uses fs.unlink

const createDpUrl = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

const profileController = {
    async getBio(req, res) {
        const username = req.session?.username;
        if (!username) {
            return res.status(401).send('Unauthorized');
        }
        try {
            const bio = await Profile.getuserbio(username);
            if (!bio) {
                return res.status(404).json({ error: "No user found" });
            } else if (bio.profile_bio === null) {
                return res.json({ profile_bio: '' });
            } else {
                return res.json(bio);
            }
        } catch (error) {
            console.error("Error fetching user bio:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async setBio(req, res) {
        const { profile_bio } = req.body;
        const username = req.session?.username;
        if (!username) {
            return res.status(401).send('Unauthorized');
        }
        try {
            const rowsUpdated = await Profile.setUserbio(username, profile_bio);
            if (rowsUpdated === 0) {
                return res.status(404).json({ error: "No user found" });
            }
            return res.status(200).json({ message: "Bio updated successfully" });
        } catch (error) {
            console.error("Error setting user bio:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // --- NEW: Worry Box Methods ---
    async getWorryBox(req, res) {
        const username = req.session?.username;
        if (!username) {
            return res.status(401).send('Unauthorized');
        }
        try {
            const result = await Profile.getWorryBox(username);
            // Return empty string if no content exists yet
            return res.json({ content: result ? result.content : '' });
        } catch (error) {
            console.error("Error fetching worry box:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async setWorryBox(req, res) {
        const { content } = req.body;
        const username = req.session?.username;
        if (!username) {
            return res.status(401).send('Unauthorized');
        }
        try {
            await Profile.setWorryBox(username, content);
            return res.status(200).json({ message: "Worry Box updated successfully" });
        } catch (error) {
            console.error("Error setting worry box:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },
    // ------------------------------

    async getDp(req, res) {
        const username = req.session?.username;
        if (!username) {
            return res.status(401).send('Unauthorized');
        }
        try {
            const dp = await Profile.getUserDp(username);
            if (!dp) {
                return res.status(404).json({ error: "No user found" });
            }
            if (!dp.profile_picture) {
                return res.json({ url: '' });
            }
            const DpUrl = createDpUrl(req, path.basename(dp.profile_picture));
            return res.json({ url: DpUrl });
        } catch (error) {
            console.error("Error fetching user dp:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async setDp(req, res) {
        const username = req.session?.username;
        if (!username) {
            return res.status(401).send('Unauthorized');
        }
        upload.single('dp')(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).json({ error: 'File upload failed' });
            }

            if (req.file) {
                const DpUrl = createDpUrl(req, req.file.filename);
                try {
                    const userResults = await Profile.getUserByName(username);
                    const user = userResults[0]; // getUserByName returns an array
                    
                    if (user && user.profile_picture) {
                        const oldDpFilename = path.basename(user.profile_picture);
                        const oldDpFullPath = path.join(__dirname, '..', 'uploads', oldDpFilename);

                        fs.unlink(oldDpFullPath, (err) => {
                            if (err) console.error('Error deleting old DP:', err);
                        });
                    }
                    const rowsUpdated = await Profile.setUserDp(username, req.file.filename);
                    if (rowsUpdated === 0) {
                        return res.status(404).json({ error: "No user found" });
                    }
                    res.status(200).json({ url: DpUrl });
                } catch (error) {
                    console.error("Error saving file path:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
            } else {
                res.status(400).send('No file uploaded.');
            }
        });
    },

    async deleteDp(req, res) {
        const username = req.session?.username;
        if (!username) {
            return res.status(401).send('Unauthorized');
        }
        try {
            const rowsUpdated = await Profile.deleteDp(username);
            if (rowsUpdated === 0) {
                return res.status(404).json({ error: "No user found" });
            }
            return res.status(200).json({ message: "DP deleted successfully" });
        } catch (error) {
            console.error("Error deleting user DP:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    async getPosts(req, res) {
        const username = req.session?.username;
        if (!username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const userResult = await Profile.getUserByName(username);
            if (!userResult || userResult.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userId = userResult[0].id;
            const posts = await Profile.getPostsForUser(userId);
            return res.json(posts || []);
        } catch (error) {
            console.error('Error fetching posts for user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async updatePosts(req, res) {
        const username = req.session?.username;
        const { id, title, content } = req.body; // Fixed: Destructured from body
        
        if (!username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            // Assumes id passed in body is the post ID
            const rowCount = await Profile.updatePostForUser(id, title, content);
            if (rowCount === 0) {
                return res.status(404).json({ error: 'Post not found or user unauthorized' });
            }
            return res.status(200).json({ message: 'Post updated successfully' });
        } catch (error) {
            console.error('Error updating post:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async deleteAccount(req, res) {
        const username = req.session?.username;
        if (!username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const deletedRowCount = await Profile.deleteAccount(username);
            if (deletedRowCount === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ error: 'Failed to clear session after deletion' });
                }
                return res.json({ message: 'Account deleted successfully' });
            });
        } catch (error) {
            console.error('Error deleting account:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = profileController;