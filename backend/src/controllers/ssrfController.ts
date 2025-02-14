import { Request, Response } from 'express';
import { IAttack, createAttack } from '../models/Attack';
import storageService from '../services/storageService';

interface SimulationResult {
  success: boolean;
  data: any;
  error?: string;
}

export const simulateSSRFAttack = async (req: Request, res: Response) => {
  try {
    const { payload, targetUrl, userId } = req.body;

    // Create new attack record
    const attack = await storageService.createAttack(createAttack({
      type: 'SSRF',
      payload,
      targetUrl,
      userId,
      status: 'RUNNING'
    }));

    // Simulate SSRF attack (for demonstration purposes only)
    const simulationResult = await simulateSSRF(payload, targetUrl) as SimulationResult;

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
    console.error('SSRF Attack simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate SSRF attack'
    });
  }
};

// Simulated SSRF attack function (for demonstration only)
const simulateSSRF = async (payload: string, targetUrl: string): Promise<SimulationResult> => {
  // This is a simulated function - DO NOT use for actual attacks
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.4; // Simulate 60% success rate
      
      if (success) {
        resolve({
          success: true,
          data: {
            vulnerabilityFound: true,
            accessedEndpoints: [
              'internal-api/users',
              'internal-api/config',
              'internal-api/secrets'
            ],
            payload: payload,
            impact: 'Critical',
            details: 'Successfully accessed internal endpoints',
            recommendations: [
              'Implement URL validation',
              'Use allowlist for allowed domains',
              'Implement proper network segmentation',
              'Use API Gateway for external requests'
            ]
          }
        });
      } else {
        resolve({
          success: false,
          error: 'SSRF attack simulation failed',
          data: {
            vulnerabilityFound: false,
            reason: 'Target implements proper SSRF protection'
          }
        });
      }
    }, 2500); // Simulate 2.5 second processing time
  });
};

export const getSSRFAttackHistory = async (req: Request, res: Response) => {
  try {
    const attacks = await storageService.findAttacks({ type: 'SSRF' });

    res.json({
      success: true,
      attacks
    });
  } catch (error) {
    console.error('Error fetching SSRF attack history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attack history'
    });
  }
}; 