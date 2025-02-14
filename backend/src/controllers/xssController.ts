import { Request, Response } from 'express';
import { IAttack, createAttack } from '../models/Attack';
import storageService from '../services/storageService';

interface SimulationResult {
  success: boolean;
  data: any;
  error?: string;
}

export const simulateXSSAttack = async (req: Request, res: Response) => {
  try {
    const { payload, targetUrl, userId } = req.body;

    // Create new attack record
    const attack = await storageService.createAttack(createAttack({
      type: 'XSS',
      payload,
      targetUrl,
      userId,
      status: 'RUNNING'
    }));

    // Simulate XSS attack (for demonstration purposes only)
    const simulationResult = await simulateXSS(payload, targetUrl) as SimulationResult;

    // Update attack record with results
    const updatedAttack = await storageService.updateAttack(attack._id, {
      status: 'COMPLETED',
      result: {
        success: simulationResult.success,
        data: simulationResult.data,
        error: simulationResult.error
      }
    });

    res.json({
      success: true,
      attackId: attack._id,
      result: simulationResult
    });
  } catch (error) {
    console.error('XSS Attack simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate XSS attack'
    });
  }
};

// Simulated XSS attack function (for demonstration only)
const simulateXSS = async (payload: string, targetUrl: string): Promise<SimulationResult> => {
  // This is a simulated function - DO NOT use for actual attacks
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.3; // Simulate 70% success rate
      
      if (success) {
        resolve({
          success: true,
          data: {
            vulnerabilityFound: true,
            injectionPoint: 'user-input',
            payload: payload,
            impact: 'High',
            details: 'Successfully injected XSS payload',
            recommendations: [
              'Implement input validation',
              'Use Content Security Policy (CSP)',
              'Sanitize user input',
              'Encode output'
            ]
          }
        });
      } else {
        resolve({
          success: false,
          error: 'XSS attack simulation failed',
          data: {
            vulnerabilityFound: false,
            reason: 'Target implements proper XSS protection'
          }
        });
      }
    }, 2000); // Simulate 2 second processing time
  });
};

export const getXSSAttackHistory = async (req: Request, res: Response) => {
  try {
    const attacks = await storageService.findAttacks({ type: 'XSS' });

    res.json({
      success: true,
      attacks
    });
  } catch (error) {
    console.error('Error fetching XSS attack history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attack history'
    });
  }
}; 