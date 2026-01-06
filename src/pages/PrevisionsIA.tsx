import { useState } from 'react';
import {
    Brain,
    Upload,
    BarChart2,
    FileText,
    AlertTriangle,
    Info,
    Settings,
    Database,
    Cpu
} from 'lucide-react';
import {
    DATASET_REQUIREMENTS,
    generateMockPredictions,
    trainModel,
    getFeatureImportance,
    type PredictionResult,
    type FeatureImportance
} from '../lib/ia.service';
import { useDarijaNotify } from '../hooks/useDarijaNotify';

export default function PrevisionsIA() {
    const { notify } = useDarijaNotify();
    const [step, setStep] = useState<'upload' | 'config' | 'training' | 'results'>('upload');
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);

    // Configuration
    const [algorithm, setAlgorithm] = useState('random_forest');
    const [horizon, setHorizon] = useState(30);
    const [datasetName, setDatasetName] = useState('');

    // Results
    const [predictions, setPredictions] = useState<PredictionResult[]>([]);
    const [importance, setImportance] = useState<FeatureImportance[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDatasetName(file.name);
            notify('success_generic', 'success'); // "Operations successful" generic Darija message
            setStep('config');
        }
    };

    const startTraining = async () => {
        setStep('training');
        setIsTraining(true);
        setProgress(0);

        // Simulate progress intervals
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        // Perform "training"
        await trainModel(algorithm, 1000);

        clearInterval(interval);
        setProgress(100);

        // Generate results
        setPredictions(generateMockPredictions(horizon));
        setImportance(getFeatureImportance());

        setTimeout(() => {
            setIsTraining(false);
            setStep('results');
            notify('success_generic', 'success'); // Using generic success for now, ideally 'training_complete'
        }, 500);
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h2 className="page-title">Prévisions IA & Maintenance Prédictive</h2>
                <p className="page-subtitle">Utilisez l'intelligence artificielle pour anticiper les pannes futures</p>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>

                {/* Left Panel: Configuration & Instructions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Dataset Requirements */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Database size={18} className="text-primary-500" />
                            Critères du Dataset
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Pour garantir des prévisions précises, votre fichier CSV doit contenir les colonnes suivantes :
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {DATASET_REQUIREMENTS.map((req, idx) => (
                                <div key={idx} style={{
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    marginBottom: '4px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{req.name}</span>
                                        <span className="badge badge-info">{req.type}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Configuration Panel */}
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings size={18} className="text-primary-500" />
                            Configuration du Modèle
                        </h3>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label">Algorithme</label>
                            <select
                                className="form-input form-select"
                                value={algorithm}
                                onChange={(e) => setAlgorithm(e.target.value)}
                                disabled={isTraining || step === 'results'}
                            >
                                <option value="random_forest">Random Forest (Recommandé)</option>
                                <option value="lstm">LSTM (Réseau de Neurones)</option>
                                <option value="xgboost">XGBoost Gradient Boosting</option>
                                <option value="logistic">Régression Logistique</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Horizon de prévision</label>
                            <div className="tabs" style={{ marginBottom: '0' }}>
                                {[7, 30, 90].map(h => (
                                    <button
                                        key={h}
                                        className={`tab ${horizon === h ? 'active' : ''}`}
                                        onClick={() => setHorizon(h)}
                                        disabled={isTraining || step === 'results'}
                                    >
                                        {h} Jours
                                    </button>
                                ))}
                            </div>
                        </div>

                        {step === 'upload' && (
                            <div style={{
                                border: '2px dashed var(--border-color)',
                                borderRadius: '12px',
                                padding: '32px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }} className="upload-zone">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    id="dataset-upload"
                                />
                                <label htmlFor="dataset-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Upload size={32} color="var(--primary-500)" style={{ marginBottom: '12px' }} />
                                    <span style={{ fontWeight: '600', marginBottom: '4px' }}>Importer un Dataset</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CSV ou Excel (Max 50MB)</span>
                                </label>
                            </div>
                        )}

                        {step === 'config' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', marginBottom: '24px' }}>
                                <FileText size={20} color="#22c55e" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{datasetName}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#22c55e' }}>Fichier chargé avec succès</div>
                                </div>
                                <button className="header-icon-btn" onClick={() => { setStep('upload'); setDatasetName(''); }}>
                                    <Upload size={16} />
                                </button>
                            </div>
                        )}

                        {(step === 'config' || step === 'training') && (
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                                onClick={startTraining}
                                disabled={isTraining}
                            >
                                {isTraining ? 'Entraînement en cours...' : <><Brain size={18} /> Lancer l'entraînement</>}
                            </button>
                        )}

                        {step === 'results' && (
                            <button
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => { setStep('config'); setPredictions([]); }}
                            >
                                Nouvelle prévision
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Panel: Visualization & Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {step === 'training' && (
                        <div className="glass-card" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                            <div className="loading-spinner" style={{ width: '64px', height: '64px', borderWidth: '6px', marginBottom: '24px' }}></div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px' }}>Entraînement du modèle IA...</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Analyse des corrélations et optimisation des hyperparamètres</p>

                            <div style={{ width: '100%', maxWidth: '400px', height: '12px', background: 'var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-gradient)', transition: 'width 0.3s ease' }}></div>
                            </div>
                            <div style={{ marginTop: '12px', fontWeight: '600', color: 'var(--primary-500)' }}>{progress}%</div>
                        </div>
                    )}

                    {step !== 'training' && step !== 'results' && (
                        <div className="glass-card" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', opacity: 0.7 }}>
                            <Cpu size={64} style={{ marginBottom: '24px', opacity: 0.2 }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-muted)' }}>En attente de configuration</h3>
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
                                Importez un dataset et configurez les paramètres pour visualiser les prévisions de maintenance.
                            </p>
                        </div>
                    )}

                    {step === 'results' && (
                        <>
                            {/* Probability Chart */}
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h3 className="card-title" style={{ marginBottom: '24px' }}>
                                    <TrendingUp size={20} className="text-primary-500" style={{ marginRight: '8px' }} />
                                    Probabilité de Panne (Prochains {horizon} jours)
                                </h3>

                                <div style={{ height: '300px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', paddingTop: '20px' }}>
                                    {predictions.map((point, i) => {
                                        const x = (i / (predictions.length - 1)) * 100;
                                        const y = point.probability * 100;
                                        const isHighRisk = point.probability > 0.7;

                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    position: 'absolute',
                                                    left: `${x}%`,
                                                    bottom: `${y}%`,
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: isHighRisk ? '#ef4444' : '#3b82f6',
                                                    transform: 'translate(-50%, 50%)',
                                                    zIndex: 10
                                                }}
                                                title={`${point.date}: ${(point.probability * 100).toFixed(1)}%`}
                                            />
                                        );
                                    })}

                                    {/* SVG Line */}
                                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                                        {/* Threshold Line */}
                                        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" />
                                        <text x="100%" y="28%" fill="#ef4444" fontSize="12" textAnchor="end">Seuil Critique (70%)</text>

                                        {/* Data Line */}
                                        <path
                                            d={`M ${predictions.map((p, i) => {
                                                const x = (i / (predictions.length - 1)) * 100; // Percentage
                                                const y = (1 - p.probability) * 100; // Inverted for SVG coords
                                                // Convert percentage to coordinate space approx for SVG if needed, 
                                                // but simplistic approach: standard SVG viewBox mapping would be better.
                                                // Using simple scaling logic:
                                                return `${x * 10}, ${y * 3}`; // Scaling to fit approx 1000x300 viewBox
                                            }).join(' L ')}`}
                                            fill="none"
                                            stroke="url(#gradientLine)"
                                            strokeWidth="3"
                                            transform="scale(0.1, 1)" // Hacky scaling to fit percentage based coordinates into viewbox
                                            vectorEffect="non-scaling-stroke"
                                        />
                                        <defs>
                                            <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#ef4444" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Début prévision</div>
                                        <div style={{ fontWeight: '600' }}>{predictions[0]?.date}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Risque Max</div>
                                        <div style={{ fontWeight: '600', color: '#ef4444' }}>
                                            {(Math.max(...predictions.map(p => p.probability)) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fin prévision</div>
                                        <div style={{ fontWeight: '600' }}>{predictions[predictions.length - 1]?.date}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Importance & Recommendation */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="glass-card" style={{ padding: '24px' }}>
                                    <h3 className="card-title" style={{ marginBottom: '16px' }}>
                                        <BarChart2 size={20} className="text-primary-500" style={{ marginRight: '8px' }} />
                                        Impact des Facteurs
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {importance.map((feat, idx) => (
                                            <div key={idx}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                    <span>{feat.feature}</span>
                                                    <span style={{ fontWeight: '600' }}>{(feat.importance * 100).toFixed(0)}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${feat.importance * 100}%`, height: '100%', background: 'var(--secondary-gradient)' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.05))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <h3 className="card-title" style={{ marginBottom: '16px', color: '#60a5fa' }}>
                                        <Info size={20} style={{ marginRight: '8px' }} />
                                        Recommandation IA
                                    </h3>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '16px', lineHeight: '1.6' }}>
                                        Le modèle détecte une augmentation significative du risque de panne d'ici <strong>{Math.floor(horizon * 0.6)} jours</strong>.
                                    </p>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f59e0b' }}>
                                            <AlertTriangle size={16} />
                                            <span style={{ fontWeight: '600' }}>Action Recommandée</span>
                                        </div>
                                        <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <li>Planifier une inspection des roulements (Vibration élevée).</li>
                                            <li>Vérifier le système de refroidissement.</li>
                                            <li>Réduire la charge de 10% si possible.</li>
                                        </ul>
                                    </div>
                                    <button className="btn btn-primary" style={{ width: '100%' }}>
                                        Générer un Ordre de Travail Préventif
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper component for lucide icons if not already imported everywhere
function TrendingUp({ size, className, style }: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
}
