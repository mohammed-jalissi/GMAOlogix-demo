
export interface PredictionResult {
    date: string;
    probability: number;
    threshold: number;
}

export interface FeatureImportance {
    feature: string;
    importance: number;
}

export const DATASET_REQUIREMENTS = [
    { name: 'Date', type: 'datetime', description: 'Date et heure de la mesure' },
    { name: 'Température (°C)', type: 'float', description: 'Température de fonctionnement' },
    { name: 'Vibration (Hz)', type: 'float', description: 'Niveau de vibration mesuré' },
    { name: 'Heures Fonctionnement', type: 'integer', description: 'Cumul d\'heures depuis mise en service' },
    { name: 'Dernière Maintenance', type: 'integer', description: 'Jours depuis la dernière intervention' },
    { name: 'Charge (%)', type: 'float', description: 'Charge actuelle de l\'équipement' }
];

export async function trainModel(_algorithm: string, _dataPoints: number): Promise<boolean> {
    // Simulate training time
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
}

export function generateMockPredictions(horizonDays: number): PredictionResult[] {
    const results: PredictionResult[] = [];
    const today = new Date();
    let currentProb = 0.05; // Initial low probability

    for (let i = 0; i < horizonDays; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Simulate increasing failure probability with some noise
        const noise = (Math.random() - 0.5) * 0.05;
        currentProb += (0.9 / horizonDays) + noise; // Trend upwards
        currentProb = Math.max(0, Math.min(1, currentProb)); // Clamp between 0 and 1

        results.push({
            date: date.toISOString().split('T')[0],
            probability: currentProb,
            threshold: 0.7
        });
    }

    return results;
}

export function getFeatureImportance(): FeatureImportance[] {
    return [
        { feature: 'Vibration (Hz)', importance: 0.35 },
        { feature: 'Heures Fonctionnement', importance: 0.25 },
        { feature: 'Température (°C)', importance: 0.20 },
        { feature: 'Dernière Maintenance', importance: 0.15 },
        { feature: 'Charge (%)', importance: 0.05 },
    ].sort((a, b) => b.importance - a.importance);
}
