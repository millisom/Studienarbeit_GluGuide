jest.mock('argon2', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    verify: jest.fn().mockResolvedValue(true),
}));

const controller = require('../../controllers/profileController');
const Profile = require('../../models/profileModel');
const fs = require('fs');


jest.mock('../../models/profileModel');
jest.mock('fs');


jest.mock('../../config/multerConfig', () => ({
    single: jest.fn(() => (req, res, callback) => {

        callback(null);
    })
}));

describe('Profile Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            session: { username: 'testuser' },
            body: {},
            params: {},
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost:3000'),
            file: null,
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    describe('getBio', () => {
        it('sollte die Bio des Users zurückgeben (200)', async () => {
            Profile.getuserbio.mockResolvedValue({ profile_bio: 'Hallo Welt' });

            await controller.getBio(req, res);

            expect(res.json).toHaveBeenCalledWith({ profile_bio: 'Hallo Welt' });
        });

        it('sollte 401 zurückgeben, wenn nicht eingeloggt', async () => {
            req.session.username = null;
            await controller.getBio(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('sollte 404 zurückgeben, wenn User nicht existiert', async () => {
            Profile.getuserbio.mockResolvedValue(null);
            await controller.getBio(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('setBio', () => {
        it('sollte die Bio erfolgreich aktualisieren (200)', async () => {
            req.body.profile_bio = 'Neue Bio';
            Profile.setUserbio.mockResolvedValue(1); 

            await controller.setBio(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Bio updated successfully" });
        });
    });

    describe('getWorryBox', () => {
        it('sollte den Inhalt der Worry Box zurückgeben', async () => {
            Profile.getWorryBox.mockResolvedValue({ content: 'Meine Sorgen' });
            await controller.getWorryBox(req, res);
            expect(res.json).toHaveBeenCalledWith({ content: 'Meine Sorgen' });
        });

        it('sollte leeren String zurückgeben, wenn kein Inhalt vorhanden', async () => {
            Profile.getWorryBox.mockResolvedValue(null);
            await controller.getWorryBox(req, res);
            expect(res.json).toHaveBeenCalledWith({ content: '' });
        });
    });

    describe('getDp (Profile Picture)', () => {
        it('sollte die korrekte URL für das Profilbild generieren', async () => {
            Profile.getUserDp.mockResolvedValue({ profile_picture: 'avatar.jpg' });

            await controller.getDp(req, res);

            expect(res.json).toHaveBeenCalledWith({
                url: 'http://localhost:3000/uploads/avatar.jpg'
            });
        });
    });


    describe('setDp (Upload)', () => {
        it('sollte altes Bild löschen und neues Bild setzen', async () => {
            req.file = { filename: 'new_image.jpg' };
            Profile.getUserByName.mockResolvedValue([{ profile_picture: 'old_image.jpg' }]);
            Profile.setUserDp.mockResolvedValue(1);


            await new Promise((resolve) => {
                res.json = jest.fn().mockImplementation(() => resolve());
                res.status = jest.fn().mockReturnThis();
                controller.setDp(req, res);
            });

            expect(fs.unlink).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                url: expect.stringContaining('new_image.jpg')
            }));
        });
    });

    describe('deleteAccount', () => {
        it('sollte Account löschen und Session zerstören (200)', async () => {
            Profile.deleteAccount.mockResolvedValue(1);
            

            req.session.destroy = jest.fn((callback) => callback(null));

            await controller.deleteAccount(req, res);

            expect(Profile.deleteAccount).toHaveBeenCalledWith('testuser');
            expect(res.json).toHaveBeenCalledWith({ message: 'Account deleted successfully' });
        });

        it('sollte 500 zurückgeben, wenn Session-Zerstörung fehlschlägt', async () => {
            Profile.deleteAccount.mockResolvedValue(1);
            
  
            req.session.destroy = jest.fn((callback) => callback(new Error('Session Error')));

            await controller.deleteAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to clear session after deletion' });
        });
    });
});