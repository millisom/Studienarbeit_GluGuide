const exportController = require('../../controllers/exportController');
const ExportModel = require('../../models/exportModel');
const puppeteer = require('puppeteer');
const generateHtmlTemplate = require('../../templates/reportTemplate'); // Pfad anpassen

// Mocks
jest.mock('../../models/exportModel');
jest.mock('../../templates/reportTemplate');
jest.mock('puppeteer');

describe('Export Controller', () => {
  let req, res, next;

  // Puppeteer Mock-Struktur
  const mockPage = {
    setContent: jest.fn(),
    pdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
  };
  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      session: { userId: 1 },
      query: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      writeHead: jest.fn(),
      end: jest.fn(),
      send: jest.fn(),
    };

    next = jest.fn();

    // Puppeteer Launch Mock
    puppeteer.launch.mockResolvedValue(mockBrowser);
    // Template Mock
    generateHtmlTemplate.mockReturnValue('<html>Test</html>');
  });

  describe('getAvailableDates', () => {
    it('sollte verfügbare Daten für den Standardzeitraum (Monat) zurückgeben', async () => {
      const mockDates = ['2023-10-01', '2023-10-02'];
      ExportModel.getAvailableDates.mockResolvedValue(mockDates);

      await exportController.getAvailableDates(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ dates: mockDates });
      // Prüfen, ob startDate korrekt berechnet wurde (ca. 1 Monat zurück)
      const callDate = ExportModel.getAvailableDates.mock.calls[0][1];
      expect(callDate).toBeInstanceOf(Date);
    });

    it('sollte das Startdatum korrekt für "week" berechnen', async () => {
      req.query.range = 'week';
      await exportController.getAvailableDates(req, res, next);
      
      const startDate = ExportModel.getAvailableDates.mock.calls[0][1];
      const today = new Date();
      const diffDays = Math.round((today - startDate) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });
  });

  describe('generatePdf', () => {
    const mockRawData = {
      glucoseLogs: [
        { date: '2023-10-01', reading_type: 'fasting', glucose_level: 95.4, time: '08:00:00' },
        { date: '2023-10-01', reading_type: '1h_post_meal', glucose_level: 140, time: '13:00:00', meal_id: 10 }
      ],
      meals: [
        { meal_id: 10, date: '2023-10-01', meal_type: 'lunch', meal_time: '2023-10-01T12:00:00Z', total_carbs: 50.5, items: 'Pasta' }
      ]
    };

    it('sollte 400 zurückgeben, wenn keine Daten ausgewählt wurden', async () => {
      req.body.selectedDates = [];
      await exportController.generatePdf(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('sollte erfolgreich ein PDF generieren und senden', async () => {
      req.body.selectedDates = ['2023-10-01'];
      ExportModel.getReportData.mockResolvedValue(mockRawData);

      await exportController.generatePdf(req, res, next);

      // Check Model Aufruf
      expect(ExportModel.getReportData).toHaveBeenCalledWith(1, ['2023-10-01']);
      
      // Check Puppeteer Flow
      expect(puppeteer.launch).toHaveBeenCalled();
      expect(mockPage.setContent).toHaveBeenCalledWith('<html>Test</html>', expect.any(Object));
      
      // Check Response
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'application/pdf'
      }));
      expect(res.end).toHaveBeenCalledWith(expect.any(Buffer));
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('sollte Daten korrekt transformieren (Fasting & Meals)', async () => {
      req.body.selectedDates = ['2023-10-01'];
      ExportModel.getReportData.mockResolvedValue(mockRawData);

      await exportController.generatePdf(req, res, next);

      const transformedData = generateHtmlTemplate.mock.calls[0][0];
      
      // Fasting Check (parseFloat.toFixed(0))
      expect(transformedData['2023-10-01'].fasting.level).toBe('95');
      
      // Meal Check (Number.toFixed(1))
      expect(transformedData['2023-10-01'].meals[0].carbs).toBe('50.5');
      expect(transformedData['2023-10-01'].meals[0].type).toBe('lunch');
    });

    it('sollte den Browser schließen und 500 senden, wenn ein Fehler auftritt', async () => {
      req.body.selectedDates = ['2023-10-01'];
      ExportModel.getReportData.mockRejectedValue(new Error('PDF Fail'));

      await exportController.generatePdf(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Error generating PDF");
    });
  });
});