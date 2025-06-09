import { Request, Response } from "express";
import { AnalyticsService } from "../services/analyticsService";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getAnalytics(req: Request, res: Response) {
    try {
      const analytics = await analyticsService.getAnalytics();
      res.json(analytics);
    } catch (error) {
      throw new Error("Failed to fetch analytics");
    }
  }
}
