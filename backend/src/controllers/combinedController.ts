import { Request, Response } from 'express';
import { IAttack, createAttack } from '../models/Attack';
import storageService from '../services/storageService';

interface SimulationResult {
  success: boolean;
  data: any;
  error?: string;
}

export const simulateCombinedAttack = async (req: Request, res: Response) => {
  try {
    const { xssPayload, ssrfPayload, targetUrl, userId } = req.body;

    // Create new attack record
    const attack = await storageService.createAttack(createAttack({
      type: 'COMBINED',
      payload: JSON.stringify({ xss: xssPayload, ssrf: ssrfPayload }),
      targetUrl,
      userId,
      status: 'RUNNING'
    }));

    // Simulate combined XSS+SSRF attack (for demonstration purposes only)
    const simulationResult = await simulateCombined(xssPayload, ssrfPayload, targetUrl) as SimulationResult;

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
    console.error('Combined Attack simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to simulate combined attack'
    });
  }
};

// Simulated combined attack function (for demonstration only)
const simulateCombined = async (xssPayload: string, ssrfPayload: string, targetUrl: string): Promise<SimulationResult> => {
  // This is a simulated function - DO NOT use for actual attacks
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.5; // Simulate 50% success rate
      
      if (success) {
        resolve({
          success: true,
          data: {
            vulnerabilityFound: true,
            attackSteps: [
              {
                step: 1,
                type: 'XSS',
                details: 'Injected malicious script via user input',
                success: true
              },
              {
                step: 2,
                type: 'SSRF',
                details: 'Leveraged XSS to trigger internal SSRF request',
                success: true
              },
              {
                step: 3,
                type: 'DATA_EXFILTRATION',
                details: 'Retrieved sensitive data from internal endpoints',
                success: true
              }
            ],
            impact: 'Critical',
            details: 'Successfully executed combined XSS+SSRF attack chain',
            recommendations: [
              'Implement comprehensive input validation',
              'Use Content Security Policy (CSP)',
              'Implement URL validation and allowlisting',
              'Segment internal network properly',
              'Implement proper session management',
              'Use Web Application Firewall (WAF)'
            ]
          }
        });
      } else {
        resolve({
          success: false,
          error: 'Combined attack simulation failed',
          data: {
            vulnerabilityFound: false,
            reason: 'Target implements proper security controls',
            failedAt: Math.random() > 0.5 ? 'XSS' : 'SSRF'
          }
        });
      }
    }, 3000); // Simulate 3 second processing time
  });
};

export const getCombinedAttackHistory = async (req: Request, res: Response) => {
  try {
    const attacks = await storageService.findAttacks({ type: 'COMBINED' });

    res.json({
      success: true,
      attacks
    });
  } catch (error) {
    console.error('Error fetching combined attack history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attack history'
    });
  }
}; 