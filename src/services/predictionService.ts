import type { PredictionModelType, PredictionParams } from '../types';

interface DataPoint {
    date: string;
    value: number; // Actual historical value
}

/**
 * Prediction Service
 * Handles statistical models for supply forecasting.
 */
export const PredictionService = {

    /**
     * 1. Moving Average (SMA)
     * Simple average of the last N days. Smooths out noise.
     */
    calculateMovingAverage: (data: DataPoint[], windowSize: number = 7): number => {
        if (data.length < windowSize) return 0;
        const slice = data.slice(-windowSize);
        const sum = slice.reduce((acc, curr) => acc + curr.value, 0);
        return sum / windowSize;
    },

    /**
     * 2. Linear Regression
     * Fits a straight line (y = mx + c) to historical data to project future trend.
     */
    calculateLinearRegression: (data: DataPoint[], daysToProject: number = 1): number => {
        if (data.length < 2) return 0;

        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        // Reset sums
        sumX = 0; sumY = 0; sumXY = 0; sumXX = 0;

        data.forEach((point, index) => {
            const x = index; // Time as independent variable
            const y = point.value;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict for the next day (index = n + daysToProject - 1)
        const nextX = n + daysToProject - 1;
        return slope * nextX + intercept;
    },

    /**
     * 3. Exponential Smoothing
     * Recent observations have relatively more weight in forecasting than the older observations.
     * Alpha (0 < a < 1): Closer to 1 weights recent data more heavily.
     */
    calculateExponentialSmoothing: (data: DataPoint[], alpha: number = 0.5): number => {
        if (data.length === 0) return 0;
        let forecast = data[0].value;

        for (let i = 1; i < data.length; i++) {
            forecast = alpha * data[i].value + (1 - alpha) * forecast;
        }

        return forecast;
    },

    /**
     * 4. Hybrid / AI Model
     * Combines Linear Regression trend with Weather Penalties.
     */
    calculateHybridPrediction: (
        data: DataPoint[],
        params: PredictionParams
    ): number => {
        // Base: Linear Regression for trend
        let prediction = PredictionService.calculateLinearRegression(data);

        // Weather Factor
        if (params.weatherOverride) {
            let impact = 1.0;
            switch (params.weatherOverride) {
                case 'Hujan Deras': impact = 0.70; break; // -30%
                case 'Hujan Ringan': impact = 0.90; break; // -10%
                case 'Berawan': impact = 0.98; break; // -2%
                case 'Cerah': impact = 1.05; break; // +5% boost
            }
            prediction *= impact;
        }

        // Holiday Factor
        if (params.isHoliday) {
            prediction *= 0.5; // -50% on holidays
        }

        return Math.max(0, prediction); // No negative supply
    },

    /**
     * Standard Deviation helper for Confidence Intervals
     */
    calculateStandardDeviation: (data: DataPoint[]): number => {
        if (data.length === 0) return 0;
        const mean = data.reduce((a, b) => a + b.value, 0) / data.length;
        const variance = data.reduce((a, b) => a + Math.pow(b.value - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    },

    /**
     * Generate Full Project Dataset with selected model
     */
    generateProjections: (
        historicalData: DataPoint[],
        daysToForecast: number,
        model: PredictionModelType,
        params: PredictionParams = {}
    ) => {
        const projections = [];
        let currentHistory = [...historicalData];
        const stdDev = PredictionService.calculateStandardDeviation(historicalData); // Simplified: Using historical volatility

        for (let i = 1; i <= daysToForecast; i++) {
            let val = 0;
            switch (model) {
                case 'moving_average':
                    val = PredictionService.calculateMovingAverage(currentHistory);
                    break;
                case 'linear_reg':
                    val = PredictionService.calculateLinearRegression(currentHistory, 1); // Step 1 day forward relative to currentHistory
                    break;
                case 'exponential':
                    val = PredictionService.calculateExponentialSmoothing(currentHistory, 0.6);
                    break;
                case 'hybrid':
                    val = PredictionService.calculateHybridPrediction(currentHistory, params);
                    break;
            }

            // Lower/Upper bounds (95% CI Approx: +/- 1.96 * StdDev)
            // Note: In real world, StdDev should widen as time goes on. 
            // Here we basically keep it constant or slightly widening for visual simplicity.
            const uncertaintyMultiplier = 1 + (i * 0.1); // Uncertainty grows over time
            const margin = stdDev * 1.0 * uncertaintyMultiplier;

            projections.push({
                predicted: Math.round(val),
                lowerBound: Math.max(0, Math.round(val - margin)),
                upperBound: Math.round(val + margin)
            });

            // Feed naive prediction back into history for next step (recursive forecasting)
            // Note: For Linear Reg, we should actually rely on the slope from original dataset, 
            // but recursive is easier for generic architecture here.
            currentHistory.push({ date: `Future-${i}`, value: val });
        }
        return projections;
    }
};
