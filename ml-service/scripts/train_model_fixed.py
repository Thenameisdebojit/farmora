import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import tensorflow as tf
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import logging
import json
from datetime import datetime

from config.config import MODEL_CONFIG, TRAINED_MODEL_PATH, LOGS_DIR, MODEL_DIR
from scripts.data_preparation import PestDataPreprocessor
from scripts.model_architecture import PestDetectionModel, FocalLoss, F1Score

# Set up logging
LOGS_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / 'training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PestModelTrainer:
    def __init__(self, model_type='transfer_learning'):
        self.model_type = model_type
        self.model = None
        self.history = None
        self.data_preprocessor = PestDataPreprocessor()
        self.model_builder = PestDetectionModel()
        
        # Ensure model directory exists
        MODEL_DIR.mkdir(exist_ok=True)
        
    def prepare_data(self, data_dir=None):
        """Prepare training, validation, and test data"""
        logger.info("Preparing dataset...")
        
        # Prepare dataset
        data_package = self.data_preprocessor.prepare_dataset(data_dir)
        
        self.train_generator = data_package['train_generator']
        self.val_generator = data_package['val_generator']
        self.test_data = data_package['test_data']
        self.class_names = data_package['class_names']
        
        logger.info(f"Data preparation completed. Classes: {len(self.class_names)}")
        logger.info(f"Train samples: {self.train_generator.samples}")
        logger.info(f"Val samples: {self.val_generator.samples}")
        logger.info(f"Test samples: {len(self.test_data[0])}")
        
        return data_package
    
    def build_model(self):
        """Build the model based on specified type"""
        logger.info(f"Building {self.model_type} model...")
        
        self.model = self.model_builder.build_model(self.model_type)
        
        # Print model summary
        logger.info("Model architecture:")
        self.model.summary()
        
        return self.model
    
    def train_model(self, epochs=None, use_focal_loss=False):
        """Train the model with advanced techniques"""
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")
        
        epochs = epochs or MODEL_CONFIG['epochs']
        
        logger.info(f"Starting training for {epochs} epochs...")
        
        # Setup callbacks
        model_path = MODEL_DIR / f"best_model_{self.model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.h5"
        callbacks = self.model_builder.get_callbacks(str(model_path))
        
        # Add custom callbacks
        callbacks.extend([
            tf.keras.callbacks.CSVLogger(
                LOGS_DIR / f"training_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            ),
            tf.keras.callbacks.TensorBoard(
                log_dir=LOGS_DIR / "tensorboard" / datetime.now().strftime('%Y%m%d_%H%M%S'),
                histogram_freq=1,
                write_graph=True,
                write_images=True
            )
        ])
        
        # Recompile with focal loss if requested
        if use_focal_loss:
            logger.info("Using Focal Loss for training...")
            self.model.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=MODEL_CONFIG['learning_rate']),
                loss=FocalLoss(),
                metrics=['accuracy', F1Score(), 'precision', 'recall']
            )
        
        # Calculate steps per epoch
        steps_per_epoch = self.train_generator.samples // MODEL_CONFIG['batch_size']
        validation_steps = self.val_generator.samples // MODEL_CONFIG['batch_size']
        
        # Train model
        try:
            self.history = self.model.fit(
                self.train_generator,
                epochs=epochs,
                steps_per_epoch=steps_per_epoch,
                validation_data=self.val_generator,
                validation_steps=validation_steps,
                callbacks=callbacks,
                verbose=1
            )
            
            logger.info("Training completed successfully!")
            
            # Save final model
            final_model_path = MODEL_DIR / f"final_model_{self.model_type}.h5"
            self.model.save(str(final_model_path))
            logger.info(f"Final model saved to {final_model_path}")
            
        except Exception as e:
            logger.error(f"Training failed: {str(e)}")
            raise
        
        return self.history
    
    def evaluate_model(self):
        """Evaluate model performance on test data"""
        if self.model is None or self.test_data is None:
            raise ValueError("Model and test data must be available")
        
        logger.info("Evaluating model performance...")
        
        X_test, y_test = self.test_data
        
        # Evaluate on test data
        test_loss, test_accuracy, test_precision, test_recall = self.model.evaluate(
            X_test, y_test, verbose=0
        )[:4]
        
        # Get predictions
        y_pred = self.model.predict(X_test)
        y_pred_classes = np.argmax(y_pred, axis=1)
        y_true_classes = np.argmax(y_test, axis=1)
        
        # Calculate additional metrics
        from sklearn.metrics import f1_score, accuracy_score
        f1 = f1_score(y_true_classes, y_pred_classes, average='weighted')
        accuracy = accuracy_score(y_true_classes, y_pred_classes)
        
        # Create evaluation report
        evaluation_results = {
            'test_accuracy': float(accuracy),
            'test_precision': float(test_precision),
            'test_recall': float(test_recall),
            'test_f1_score': float(f1),
            'test_loss': float(test_loss),
            'model_type': self.model_type,
            'num_classes': len(self.class_names),
            'test_samples': len(X_test)
        }
        
        logger.info(f"Evaluation Results:")
        logger.info(f"Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        logger.info(f"Test Precision: {test_precision:.4f}")
        logger.info(f"Test Recall: {test_recall:.4f}")
        logger.info(f"Test F1-Score: {f1:.4f}")
        
        # Save evaluation results
        eval_path = LOGS_DIR / f"evaluation_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(eval_path, 'w') as f:
            json.dump(evaluation_results, f, indent=2)
        
        # Generate classification report
        report = classification_report(
            y_true_classes, y_pred_classes,
            target_names=self.class_names,
            output_dict=True
        )
        
        # Save classification report
        report_path = LOGS_DIR / f"classification_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Create and save confusion matrix
        self.plot_confusion_matrix(y_true_classes, y_pred_classes)
        
        return evaluation_results
    
    def plot_confusion_matrix(self, y_true, y_pred):
        """Plot and save confusion matrix"""
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(15, 12))
        sns.heatmap(
            cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=self.class_names,
            yticklabels=self.class_names
        )
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        plt.tight_layout()
        
        # Save plot
        cm_path = LOGS_DIR / f"confusion_matrix_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(cm_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Confusion matrix saved to {cm_path}")
    
    def save_model_for_production(self, model_name="pest_detection_model"):
        """Save model in production-ready format"""
        if self.model is None:
            raise ValueError("No model to save")
        
        # Save in multiple formats for flexibility
        
        # 1. Save as H5 format
        h5_path = MODEL_DIR / f"{model_name}.h5"
        self.model.save(str(h5_path))
        
        # 2. Save as TensorFlow SavedModel format
        savedmodel_path = MODEL_DIR / f"{model_name}_savedmodel"
        tf.saved_model.save(self.model, str(savedmodel_path))
        
        # 3. Save model configuration
        config = {
            'model_type': self.model_type,
            'input_shape': self.model_builder.input_shape,
            'num_classes': self.model_builder.num_classes,
            'class_names': self.class_names,
            'model_config': self.model.get_config(),
            'training_params': MODEL_CONFIG
        }
        
        config_path = MODEL_DIR / f"{model_name}_config.json"
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2, default=str)
        
        logger.info(f"Production model saved:")
        logger.info(f"  H5 format: {h5_path}")
        logger.info(f"  SavedModel: {savedmodel_path}")
        logger.info(f"  Config: {config_path}")
        
        return {
            'h5_path': str(h5_path),
            'savedmodel_path': str(savedmodel_path),
            'config_path': str(config_path)
        }
    
    def full_training_pipeline(self, data_dir=None, epochs=None, use_fine_tuning=True):
        """Complete training pipeline"""
        logger.info("Starting full training pipeline...")
        
        try:
            # 1. Prepare data
            self.prepare_data(data_dir)
            
            # 2. Build model
            self.build_model()
            
            # 3. Train model
            self.train_model(epochs)
            
            # 4. Evaluate model
            results = self.evaluate_model()
            
            # 5. Save production model
            model_paths = self.save_model_for_production()
            
            # Check if we achieved target accuracy
            target_accuracy = 0.97
            achieved_accuracy = results['test_accuracy']
            
            logger.info(f"\n{'='*50}")
            logger.info(f"TRAINING PIPELINE COMPLETED")
            logger.info(f"Target Accuracy: {target_accuracy*100:.1f}%")
            logger.info(f"Achieved Accuracy: {achieved_accuracy*100:.2f}%")
            
            if achieved_accuracy >= target_accuracy:
                logger.info(f"🎉 SUCCESS: Target accuracy achieved!")
            else:
                logger.info(f"⚠️  Target accuracy not reached. Consider:")
                logger.info(f"   - More training data")
                logger.info(f"   - Longer training")
                logger.info(f"   - Different model architecture")
                logger.info(f"   - Hyperparameter tuning")
            
            logger.info(f"{'='*50}\n")
            
            return {
                'evaluation_results': results,
                'model_paths': model_paths,
                'target_achieved': achieved_accuracy >= target_accuracy
            }
            
        except Exception as e:
            logger.error(f"Training pipeline failed: {str(e)}")
            raise

def main():
    """Main training function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train pest detection model')
    parser.add_argument('--model-type', choices=['advanced_cnn', 'transfer_learning', 'ensemble'],
                       default='transfer_learning', help='Type of model to train')
    parser.add_argument('--epochs', type=int, default=50, help='Number of epochs to train')
    parser.add_argument('--data-dir', type=str, help='Path to training data directory')
    
    args = parser.parse_args()
    
    # Create trainer
    trainer = PestModelTrainer(model_type=args.model_type)
    
    # Run training pipeline
    results = trainer.full_training_pipeline(
        data_dir=args.data_dir,
        epochs=args.epochs
    )
    
    return results

if __name__ == "__main__":
    results = main()