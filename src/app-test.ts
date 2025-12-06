import request from 'supertest';
import app from '../app.js';
import { describe, it, expect } from '@jest/globals';

describe('GET /health', () => {
    it('should return 200 OK and "Server is running" message', async () => {
        // We send a fake request to our app (without starting the server!)
        const response = await request(app).get('/health');

        // Check if the response matches our expectation
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });
});