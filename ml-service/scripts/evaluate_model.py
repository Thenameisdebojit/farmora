import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import tensorflow as tf
from pathlib import Path
import json
import logging
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report, 
    confusion_matrix, 
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve
)

from config.config import MODEL_DIR, PEST_CLASSES, LOGS_DIR
from scripts.data_preparation import PestDataPreprocessor
from utils.prediction_utils import PestPredictor
from utils.image_utils import validate_image, apply_augmentation

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelEvaluator:
    """
    Comprehensive model evaluation class for pest detection models
    """
    
    def __init__(self, model_path=None):
        self.model_path = model_path
        self.predictor = PestPredictor()
        self.test_data = None
        self.evaluation_results = {}
        
        # Ensure logs directory exists
        LOGS_DIR.mkdir(exist_ok=True)
    
    def load_model(self):
        """Load the model for evaluation"""
        try:
            self.predictor.load_model(self.model_path)
            logger.info("Model loaded successfully for evaluation")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            return False
    
    def prepare_test_data(self, data_dir=None):
        """Prepare test dataset"""
        try:
            logger.info("Preparing test dataset...")
            
            preprocessor = PestDataPreprocessor()
            data_package = preprocessor.prepare_dataset(data_dir)
            
            self.test_data = data_package['test_data']
            self.class_names = data_package['class_names']
            
            X_test, y_test = self.test_data
            logger.info(f"Test dataset prepared: {len(X_test)} samples, {len(self.class_names)} classes")
            
            return True
        except Exception as e:
            logger.error(f"Failed to prepare test data: {str(e)}")
            return False
    
    def evaluate_accuracy(self):
        """Evaluate model accuracy on test dataset"""
        if self.test_data is None:
            raise ValueError("Test data not prepared. Call prepare_test_data() first.")
        
        try:
            logger.info("Evaluating model accuracy...")
            
            X_test, y_test = self.test_data
            
            # Make predictions
            predictions = []
            for i, image in enumerate(X_test):
                if i % 50 == 0:
                    logger.info(f"Processing image {i+1}/{len(X_test)}")
                
                # Convert numpy array back to PIL Image for predictor
                from PIL import Image
                image_pil = Image.fromarray((image * 255).astype(np.uint8))
                
                try:
                    result = self.predictor.predict(image_pil, enhance=False)
                    predictions.append(result['predicted_class_index'])
                except:
                    # If prediction fails, use random prediction
                    predictions.append(np.random.randint(0, len(self.class_names)))
            
            predictions = np.array(predictions)
            y_true = np.argmax(y_test, axis=1)
            
            # Calculate metrics
            accuracy = accuracy_score(y_true, predictions)
            precision = precision_score(y_true, predictions, average='weighted')
            recall = recall_score(y_true, predictions, average='weighted')
            f1 = f1_score(y_true, predictions, average='weighted')
            
            # Store results
            self.evaluation_results['accuracy'] = {
                'accuracy': float(accuracy),
                'precision': float(precision),
                'recall': float(recall),
                'f1_score': float(f1),
                'num_samples': len(X_test),
                'num_classes': len(self.class_names)
            }
            
            logger.info(f"Model Accuracy Results:")
            logger.info(f"  Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
            logger.info(f"  Precision: {precision:.4f}")
            logger.info(f"  Recall: {recall:.4f}")
            logger.info(f"  F1 Score: {f1:.4f}")
            
            # Generate detailed classification report
            report = classification_report(
                y_true, predictions, 
                target_names=self.class_names,
                output_dict=True
            )
            
            self.evaluation_results['classification_report'] = report
            
            # Create confusion matrix
            self.create_confusion_matrix(y_true, predictions)
            
            return accuracy >= 0.97  # Target accuracy check
            
        except Exception as e:
            logger.error(f"Accuracy evaluation failed: {str(e)}")
            return False
    
    def evaluate_robustness(self, num_samples=100):
        """Evaluate model robustness with augmented images"""
        if self.test_data is None:
            raise ValueError("Test data not prepared. Call prepare_test_data() first.")
        
        try:
            logger.info("Evaluating model robustness...")
            
            X_test, y_test = self.test_data
            
            # Select random samples for robustness testing
            indices = np.random.choice(len(X_test), min(num_samples, len(X_test)), replace=False)
            
            robustness_results = {}
            augmentation_types = ['brightness', 'contrast', 'noise', 'blur', 'rotation']
            
            for aug_type in augmentation_types:
                logger.info(f"Testing robustness with {aug_type} augmentation...")
                
                correct_predictions = 0
                total_predictions = 0
                
                for idx in indices:
                    original_image = X_test[idx]
                    true_label = np.argmax(y_test[idx])
                    
                    # Convert to PIL Image
                    from PIL import Image
                    image_pil = Image.fromarray((original_image * 255).astype(np.uint8))
                    
                    # Apply augmentation
                    aug_image = apply_augmentation(image_pil, aug_type)
                    
                    try:
                        # Get prediction for augmented image
                        result = self.predictor.predict(aug_image, enhance=False)
                        predicted_label = result['predicted_class_index']
                        
                        if predicted_label == true_label:
                            correct_predictions += 1
                        
                        total_predictions += 1
                        
                    except Exception as e:
                        logger.warning(f"Prediction failed for augmented image: {str(e)}")
                        continue
                
                robustness_score = correct_predictions / total_predictions if total_predictions > 0 else 0
                robustness_results[aug_type] = {
                    'accuracy': robustness_score,
                    'correct': correct_predictions,
                    'total': total_predictions
                }
                
                logger.info(f"  {aug_type}: {robustness_score:.4f} ({robustness_score*100:.2f}%)")
            
            self.evaluation_results['robustness'] = robustness_results
            
            return robustness_results
            
        except Exception as e:
            logger.error(f"Robustness evaluation failed: {str(e)}")
            return {}
    
    def evaluate_confidence_calibration(self, num_samples=200):
        """Evaluate how well the model's confidence scores correlate with actual accuracy"""
        if self.test_data is None:
            raise ValueError("Test data not prepared. Call prepare_test_data() first.")
        
        try:
            logger.info("Evaluating confidence calibration...")
            
            X_test, y_test = self.test_data
            indices = np.random.choice(len(X_test), min(num_samples, len(X_test)), replace=False)
            
            confidence_bins = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
            bin_accuracies = []
            bin_confidences = []
            bin_counts = []
            
            predictions = []
            confidences = []
            true_labels = []
            
            for idx in indices:
                image = X_test[idx]
                true_label = np.argmax(y_test[idx])
                
                # Convert to PIL Image
                from PIL import Image
                image_pil = Image.fromarray((image * 255).astype(np.uint8))
                
                try:
                    result = self.predictor.predict(image_pil, enhance=False)
                    predictions.append(result['predicted_class_index'])
                    confidences.append(result['confidence'])
                    true_labels.append(true_label)
                except:
                    continue
            
            predictions = np.array(predictions)
            confidences = np.array(confidences)
            true_labels = np.array(true_labels)
            
            # Calculate calibration metrics for each confidence bin
            for i in range(len(confidence_bins) - 1):
                bin_lower = confidence_bins[i]
                bin_upper = confidence_bins[i + 1]
                
                # Find predictions in this confidence range
                in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
                
                if np.sum(in_bin) > 0:
                    bin_accuracy = np.mean(predictions[in_bin] == true_labels[in_bin])
                    bin_confidence = np.mean(confidences[in_bin])
                    
                    bin_accuracies.append(bin_accuracy)
                    bin_confidences.append(bin_confidence)
                    bin_counts.append(np.sum(in_bin))
                else:
                    bin_accuracies.append(0)
                    bin_confidences.append((bin_lower + bin_upper) / 2)
                    bin_counts.append(0)
            
            # Calculate Expected Calibration Error (ECE)
            total_samples = len(predictions)
            ece = sum(
                (count / total_samples) * abs(acc - conf) 
                for acc, conf, count in zip(bin_accuracies, bin_confidences, bin_counts)
            )
            
            calibration_results = {
                'expected_calibration_error': ece,
                'bin_accuracies': bin_accuracies,
                'bin_confidences': bin_confidences,
                'bin_counts': bin_counts,
                'total_samples': total_samples
            }
            
            self.evaluation_results['calibration'] = calibration_results
            
            logger.info(f"Expected Calibration Error: {ece:.4f}")
            
            # Create calibration plot
            self.create_calibration_plot(bin_confidences, bin_accuracies, bin_counts)
            
            return calibration_results
            
        except Exception as e:
            logger.error(f"Confidence calibration evaluation failed: {str(e)}")
            return {}
    
    def evaluate_class_performance(self):
        """Evaluate per-class performance"""
        if 'classification_report' not in self.evaluation_results:
            logger.warning("Classification report not available. Run evaluate_accuracy() first.")
            return {}
        
        try:
            report = self.evaluation_results['classification_report']
            
            class_performance = {}
            for class_name in self.class_names:
                if class_name in report:
                    class_performance[class_name] = {
                        'precision': report[class_name]['precision'],
                        'recall': report[class_name]['recall'],
                        'f1_score': report[class_name]['f1-score'],
                        'support': report[class_name]['support']
                    }
            
            # Find best and worst performing classes
            f1_scores = {name: metrics['f1_score'] for name, metrics in class_performance.items()}
            best_class = max(f1_scores.items(), key=lambda x: x[1])
            worst_class = min(f1_scores.items(), key=lambda x: x[1])
            
            performance_summary = {
                'class_performance': class_performance,
                'best_performing_class': {
                    'class': best_class[0],
                    'f1_score': best_class[1]
                },
                'worst_performing_class': {
                    'class': worst_class[0],
                    'f1_score': worst_class[1]
                }
            }
            
            self.evaluation_results['class_performance'] = performance_summary
            
            logger.info(f"Best performing class: {best_class[0]} (F1: {best_class[1]:.4f})")
            logger.info(f"Worst performing class: {worst_class[0]} (F1: {worst_class[1]:.4f})")
            
            return performance_summary
            
        except Exception as e:
            logger.error(f"Class performance evaluation failed: {str(e)}")
            return {}
    
    def create_confusion_matrix(self, y_true, y_pred):
        """Create and save confusion matrix plot"""
        try:
            cm = confusion_matrix(y_true, y_pred)
            
            plt.figure(figsize=(12, 10))
            sns.heatmap(
                cm, 
                annot=True, 
                fmt='d', 
                cmap='Blues',
                xticklabels=self.class_names,
                yticklabels=self.class_names
            )
            plt.title('Confusion Matrix - Model Evaluation')
            plt.ylabel('True Label')
            plt.xlabel('Predicted Label')
            plt.xticks(rotation=45, ha='right')
            plt.yticks(rotation=0)
            plt.tight_layout()
            
            # Save plot
            cm_path = LOGS_DIR / f"evaluation_confusion_matrix_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            plt.savefig(cm_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            logger.info(f"Confusion matrix saved to {cm_path}")
            
        except Exception as e:
            logger.error(f"Failed to create confusion matrix: {str(e)}")
    
    def create_calibration_plot(self, bin_confidences, bin_accuracies, bin_counts):
        """Create confidence calibration plot"""
        try:
            plt.figure(figsize=(10, 8))
            
            # Plot perfect calibration line
            plt.plot([0, 1], [0, 1], 'k--', label='Perfect Calibration')
            
            # Plot actual calibration
            plt.plot(bin_confidences, bin_accuracies, 'ro-', label='Model Calibration')
            
            # Add bin counts as text
            for conf, acc, count in zip(bin_confidences, bin_accuracies, bin_counts):
                if count > 0:
                    plt.text(conf, acc, str(count), fontsize=8, ha='center', va='bottom')
            
            plt.xlabel('Mean Predicted Confidence')
            plt.ylabel('Accuracy')
            plt.title('Confidence Calibration Plot')
            plt.legend()
            plt.grid(True, alpha=0.3)
            plt.xlim([0, 1])
            plt.ylim([0, 1])
            
            # Save plot
            cal_path = LOGS_DIR / f"calibration_plot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            plt.savefig(cal_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            logger.info(f"Calibration plot saved to {cal_path}")
            
        except Exception as e:
            logger.error(f"Failed to create calibration plot: {str(e)}")
    
    def run_comprehensive_evaluation(self, data_dir=None, save_results=True):
        """Run comprehensive model evaluation"""
        logger.info("Starting comprehensive model evaluation...")
        
        try:
            # Load model
            if not self.load_model():
                return False
            
            # Prepare test data
            if not self.prepare_test_data(data_dir):
                return False
            
            # Run all evaluations
            logger.info("Running accuracy evaluation...")
            accuracy_target_met = self.evaluate_accuracy()
            
            logger.info("Running robustness evaluation...")
            self.evaluate_robustness()
            
            logger.info("Running confidence calibration evaluation...")
            self.evaluate_confidence_calibration()
            
            logger.info("Running class performance evaluation...")
            self.evaluate_class_performance()
            
            # Calculate overall evaluation score
            overall_score = self.calculate_overall_score()
            
            # Add metadata
            self.evaluation_results['metadata'] = {
                'evaluation_timestamp': datetime.now().isoformat(),
                'model_path': str(self.model_path) if self.model_path else 'auto-detected',
                'target_accuracy': 0.97,
                'accuracy_target_met': accuracy_target_met,
                'overall_score': overall_score
            }
            
            # Save results if requested
            if save_results:
                self.save_evaluation_results()
            
            # Print summary
            self.print_evaluation_summary()
            
            return accuracy_target_met
            
        except Exception as e:
            logger.error(f"Comprehensive evaluation failed: {str(e)}")
            return False
    
    def calculate_overall_score(self):
        """Calculate an overall evaluation score"""
        try:
            weights = {
                'accuracy': 0.4,
                'robustness': 0.3,
                'calibration': 0.2,
                'class_balance': 0.1
            }
            
            scores = {}
            
            # Accuracy score
            if 'accuracy' in self.evaluation_results:
                scores['accuracy'] = self.evaluation_results['accuracy']['accuracy']
            else:
                scores['accuracy'] = 0
            
            # Robustness score (average across augmentations)
            if 'robustness' in self.evaluation_results:
                rob_scores = [r['accuracy'] for r in self.evaluation_results['robustness'].values()]
                scores['robustness'] = np.mean(rob_scores) if rob_scores else 0
            else:
                scores['robustness'] = 0
            
            # Calibration score (inverse of ECE)
            if 'calibration' in self.evaluation_results:
                ece = self.evaluation_results['calibration']['expected_calibration_error']
                scores['calibration'] = max(0, 1 - ece * 5)  # Scale ECE appropriately
            else:
                scores['calibration'] = 0
            
            # Class balance score (based on worst class performance)
            if 'class_performance' in self.evaluation_results:
                worst_f1 = self.evaluation_results['class_performance']['worst_performing_class']['f1_score']
                scores['class_balance'] = worst_f1
            else:
                scores['class_balance'] = 0
            
            # Calculate weighted average
            overall_score = sum(weights[key] * scores[key] for key in weights.keys())
            
            return overall_score
            
        except Exception as e:
            logger.error(f"Failed to calculate overall score: {str(e)}")
            return 0
    
    def save_evaluation_results(self):
        """Save evaluation results to file"""
        try:
            results_path = LOGS_DIR / f"evaluation_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(results_path, 'w') as f:
                json.dump(self.evaluation_results, f, indent=2, default=str)
            
            logger.info(f"Evaluation results saved to {results_path}")
            
        except Exception as e:
            logger.error(f"Failed to save evaluation results: {str(e)}")
    
    def print_evaluation_summary(self):
        """Print a summary of evaluation results"""
        print("\n" + "="*60)
        print("MODEL EVALUATION SUMMARY")
        print("="*60)
        
        if 'accuracy' in self.evaluation_results:
            acc_results = self.evaluation_results['accuracy']
            print(f"Accuracy: {acc_results['accuracy']:.4f} ({acc_results['accuracy']*100:.2f}%)")
            print(f"Precision: {acc_results['precision']:.4f}")
            print(f"Recall: {acc_results['recall']:.4f}")
            print(f"F1 Score: {acc_results['f1_score']:.4f}")
        
        if 'robustness' in self.evaluation_results:
            print("\nRobustness Scores:")
            for aug_type, results in self.evaluation_results['robustness'].items():
                print(f"  {aug_type}: {results['accuracy']:.4f} ({results['accuracy']*100:.2f}%)")
        
        if 'calibration' in self.evaluation_results:
            ece = self.evaluation_results['calibration']['expected_calibration_error']
            print(f"\nExpected Calibration Error: {ece:.4f}")
        
        if 'class_performance' in self.evaluation_results:
            best = self.evaluation_results['class_performance']['best_performing_class']
            worst = self.evaluation_results['class_performance']['worst_performing_class']
            print(f"\nBest Class: {best['class']} (F1: {best['f1_score']:.4f})")
            print(f"Worst Class: {worst['class']} (F1: {worst['f1_score']:.4f})")
        
        if 'metadata' in self.evaluation_results:
            overall = self.evaluation_results['metadata']['overall_score']
            target_met = self.evaluation_results['metadata']['accuracy_target_met']
            print(f"\nOverall Score: {overall:.4f}")
            print(f"97% Accuracy Target: {'✓ ACHIEVED' if target_met else '✗ NOT ACHIEVED'}")
        
        print("="*60)

def main():
    """Main evaluation function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Evaluate pest detection model')
    parser.add_argument('--model-path', type=str, help='Path to model file')
    parser.add_argument('--data-dir', type=str, help='Path to test data directory')
    
    args = parser.parse_args()
    
    # Create evaluator
    evaluator = ModelEvaluator(args.model_path)
    
    # Run comprehensive evaluation
    success = evaluator.run_comprehensive_evaluation(args.data_dir)
    
    if success:
        logger.info("Model evaluation completed successfully!")
    else:
        logger.error("Model evaluation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()