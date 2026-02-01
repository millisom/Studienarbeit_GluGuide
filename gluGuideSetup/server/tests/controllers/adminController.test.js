const adminController = require('../../controllers/adminController');
const pool = require('../../config/db');


jest.mock('../../config/db');

describe('AdminController (Vor Refactoring)', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('listUsers sollte eine Liste von Benutzern zurückgeben (Status 200)', async () => {
        const mockUsers = [
            { id: 1, username: 'TestUser1', is_admin: false },
            { id: 2, username: 'AdminUser', is_admin: true }
        ];
        pool.query.mockResolvedValue({ rows: mockUsers });


        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

  
        await adminController.listUsers(req, res);

       
        expect(pool.query).toHaveBeenCalledTimes(1); 
        expect(res.status).toHaveBeenCalledWith(200); 
        expect(res.json).toHaveBeenCalledWith(mockUsers); 
    });

   
    it('listUsers sollte bei DB-Fehler Status 500 senden', async () => {
        
        pool.query.mockRejectedValue(new Error('Datenbank Fehler'));

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

       
        await adminController.listUsers(req, res);

       
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
            error: "Server error retrieving users." 
        }));
    });
});