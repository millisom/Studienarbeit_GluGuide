const adminController = require('../../controllers/adminController');
const UserModel = require('../../models/userModel'); 


jest.mock('../../models/userModel'); 

describe('AdminController (Nach Refactoring)', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    it('listUsers sollte User via UserModel abrufen', async () => {

        const mockUsers = [{ id: 1, username: 'TestUser' }];
        
        UserModel.getAllUsers.mockResolvedValue(mockUsers); 

        const req = {};
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };


        await adminController.listUsers(req, res);

        expect(UserModel.getAllUsers).toHaveBeenCalledTimes(1); 
        expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('listUsers sollte Fehler vom Model weitergeben', async () => {
        UserModel.getAllUsers.mockRejectedValue(new Error('Model Fehler'));

        const req = {};
        const res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };

        await adminController.listUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});