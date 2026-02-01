const Post = require('../../models/postModel');
const pool = require('../../config/db');


jest.mock('../../config/db');

describe('PostModel Transaction Safety', () => {
    let mockClient;

    beforeEach(() => {
        jest.clearAllMocks();
        

        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };
        

        pool.connect.mockResolvedValue(mockClient);
    });

    it('createPost sollte eine Transaktion starten, committen und die Verbindung freigeben', async () => {

        const mockPost = { id: 1, title: 'Test', user_id: 1 };
        

        mockClient.query.mockImplementation((sql) => {

            if (sql === 'BEGIN') return Promise.resolve();
            

            if (sql.includes('INSERT INTO posts')) {
                return Promise.resolve({ rows: [mockPost] });
            }

            if (sql.includes('SELECT id FROM tags')) return Promise.resolve({ rows: [] });
            if (sql.includes('INSERT INTO tags')) return Promise.resolve({ rows: [{ id: 99 }] });

     
            if (sql === 'COMMIT') return Promise.resolve();


            return Promise.resolve({ rows: [] });
        });


        jest.spyOn(Post, 'getPostById').mockResolvedValue(mockPost);


        await Post.createPost(1, 'Title', 'Content', 'pic.jpg', []);


        expect(pool.connect).toHaveBeenCalledTimes(1);
        

        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        

        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO posts'), 
            expect.any(Array)
        );
        

        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

        expect(mockClient.release).toHaveBeenCalledTimes(1);
    });

    it('createPost sollte bei Fehlern ein ROLLBACK machen und freigeben', async () => {

        mockClient.query.mockImplementation((sql) => {

            if (sql === 'BEGIN') return Promise.resolve();
            

            if (sql === 'ROLLBACK') return Promise.resolve();
            

            return Promise.reject(new Error('DB Error'));
        });

        await expect(Post.createPost(1, 'Title', 'Content', 'pic', []))
            .rejects.toThrow('Failed to create post in database.');


        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        
        expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
});