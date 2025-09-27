import tensorflow as tf
from tensorflow.keras import layers, models, regularizers
from tensorflow.keras.applications import EfficientNetB3, ResNet50V2
from tensorflow.keras.optimizers import Adam, RMSprop
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from config.config import MODEL_CONFIG, PEST_CLASSES
import logging

logger = logging.getLogger(__name__)

class PestDetectionModel:
    def __init__(self, input_shape=None, num_classes=None):
        self.input_shape = input_shape or MODEL_CONFIG['input_shape']
        self.num_classes = num_classes or MODEL_CONFIG['num_classes']
        self.model = None
        
    def create_advanced_cnn_model(self):
        """Create an advanced CNN model with multiple techniques for high accuracy"""
        
        # Input layer
        inputs = layers.Input(shape=self.input_shape)
        
        # Data augmentation layer (applied during training only)
        x = layers.RandomFlip("horizontal_and_vertical")(inputs)
        x = layers.RandomRotation(0.2)(x)
        x = layers.RandomZoom(0.2)(x)
        x = layers.RandomContrast(0.2)(x)
        
        # Preprocessing
        x = layers.Rescaling(1./255)(x)
        
        # First Conv Block with Attention
        x = layers.Conv2D(64, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(64, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        # Attention mechanism
        attention1 = self.attention_block(x, 64)
        x = layers.Add()([x, attention1])
        x = layers.MaxPooling2D((2, 2))(x)
        x = layers.Dropout(0.25)(x)
        
        # Second Conv Block with Attention
        x = layers.Conv2D(128, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(128, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        attention2 = self.attention_block(x, 128)
        x = layers.Add()([x, attention2])
        x = layers.MaxPooling2D((2, 2))(x)
        x = layers.Dropout(0.25)(x)
        
        # Third Conv Block with Attention
        x = layers.Conv2D(256, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(256, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        attention3 = self.attention_block(x, 256)
        x = layers.Add()([x, attention3])
        x = layers.MaxPooling2D((2, 2))(x)
        x = layers.Dropout(0.3)(x)
        
        # Fourth Conv Block with Attention
        x = layers.Conv2D(512, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Conv2D(512, (3, 3), padding='same')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        
        attention4 = self.attention_block(x, 512)
        x = layers.Add()([x, attention4])
        x = layers.MaxPooling2D((2, 2))(x)
        x = layers.Dropout(0.3)(x)
        
        # Global Average Pooling
        x = layers.GlobalAveragePooling2D()(x)
        
        # Dense layers with regularization
        x = layers.Dense(1024, kernel_regularizer=regularizers.l2(0.001))(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Dropout(0.5)(x)
        
        x = layers.Dense(512, kernel_regularizer=regularizers.l2(0.001))(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Dropout(0.5)(x)
        
        # Output layer
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        # Create model
        model = models.Model(inputs, outputs)
        
        return model
    
    def attention_block(self, input_feature, filters):
        """Attention mechanism to focus on important features"""
        
        # Channel attention
        avg_pool = layers.GlobalAveragePooling2D()(input_feature)
        max_pool = layers.GlobalMaxPooling2D()(input_feature)
        
        avg_pool = layers.Reshape((1, 1, filters))(avg_pool)
        max_pool = layers.Reshape((1, 1, filters))(max_pool)
        
        # Shared MLP
        avg_pool = layers.Dense(filters // 8, activation='relu')(avg_pool)
        avg_pool = layers.Dense(filters, activation='sigmoid')(avg_pool)
        
        max_pool = layers.Dense(filters // 8, activation='relu')(max_pool)
        max_pool = layers.Dense(filters, activation='sigmoid')(max_pool)
        
        channel_attention = layers.Add()([avg_pool, max_pool])
        
        # Apply channel attention
        feature = layers.Multiply()([input_feature, channel_attention])
        
        # Spatial attention
        avg_pool_spatial = tf.reduce_mean(feature, axis=3, keepdims=True)
        max_pool_spatial = tf.reduce_max(feature, axis=3, keepdims=True)
        spatial_attention = layers.Concatenate(axis=3)([avg_pool_spatial, max_pool_spatial])
        spatial_attention = layers.Conv2D(1, (7, 7), padding='same', activation='sigmoid')(spatial_attention)
        
        # Apply spatial attention
        feature = layers.Multiply()([feature, spatial_attention])
        
        return feature
    
    def create_transfer_learning_model(self, base_model_name='EfficientNetB3'):
        """Create a transfer learning model using pre-trained weights"""
        
        # Load pre-trained base model
        if base_model_name == 'EfficientNetB3':
            base_model = EfficientNetB3(
                weights='imagenet',
                include_top=False,
                input_shape=self.input_shape
            )
        elif base_model_name == 'ResNet50V2':
            base_model = ResNet50V2(
                weights='imagenet',
                include_top=False,
                input_shape=self.input_shape
            )
        else:
            raise ValueError(f"Unsupported base model: {base_model_name}")
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Add custom head
        inputs = tf.keras.Input(shape=self.input_shape)
        
        # Data augmentation
        x = layers.RandomFlip("horizontal_and_vertical")(inputs)
        x = layers.RandomRotation(0.1)(x)
        x = layers.RandomZoom(0.1)(x)
        
        # Preprocess input for the base model
        x = tf.keras.applications.efficientnet.preprocess_input(x)
        
        # Base model
        x = base_model(x, training=False)
        
        # Custom classification head
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)
        
        x = layers.Dense(512, kernel_regularizer=regularizers.l2(0.001))(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Dropout(0.5)(x)
        
        x = layers.Dense(256, kernel_regularizer=regularizers.l2(0.001))(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation('relu')(x)
        x = layers.Dropout(0.3)(x)
        
        # Output layer
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        model = tf.keras.Model(inputs, outputs)
        
        return model, base_model
    
    def create_ensemble_model(self):
        """Create an ensemble of different models for higher accuracy"""
        
        # Create multiple models
        cnn_model = self.create_advanced_cnn_model()
        transfer_model, _ = self.create_transfer_learning_model('EfficientNetB3')
        resnet_model, _ = self.create_transfer_learning_model('ResNet50V2')
        
        # Input layer
        inputs = layers.Input(shape=self.input_shape)
        
        # Get predictions from each model
        cnn_pred = cnn_model(inputs)
        transfer_pred = transfer_model(inputs)
        resnet_pred = resnet_model(inputs)
        
        # Average the predictions
        ensemble_pred = layers.Average()([cnn_pred, transfer_pred, resnet_pred])
        
        # Create ensemble model
        ensemble_model = models.Model(inputs, ensemble_pred)
        
        return ensemble_model
    
    def compile_model(self, model, learning_rate=None):
        """Compile the model with appropriate optimizer and metrics"""
        
        lr = learning_rate or MODEL_CONFIG['learning_rate']
        
        # Use Adam optimizer with learning rate scheduling
        optimizer = Adam(
            learning_rate=lr,
            beta_1=0.9,
            beta_2=0.999,
            epsilon=1e-7
        )
        
        # Compile model
        model.compile(
            optimizer=optimizer,
            loss='categorical_crossentropy',
            metrics=[
                'accuracy',
                tf.keras.metrics.Precision(name='precision'),
                tf.keras.metrics.Recall(name='recall'),
                tf.keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')
            ]
        )
        
        return model
    
    def get_callbacks(self, model_path=None):
        """Get callbacks for training"""
        
        callbacks = [
            EarlyStopping(
                monitor='val_accuracy',
                patience=MODEL_CONFIG['patience'],
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.2,
                patience=5,
                min_lr=1e-7,
                verbose=1
            )
        ]
        
        if model_path:
            callbacks.append(
                ModelCheckpoint(
                    filepath=model_path,
                    monitor='val_accuracy',
                    save_best_only=True,
                    save_weights_only=False,
                    verbose=1
                )
            )
        
        return callbacks
    
    def build_model(self, model_type='advanced_cnn'):
        """Build and return the specified model type"""
        
        if model_type == 'advanced_cnn':
            self.model = self.create_advanced_cnn_model()
        elif model_type == 'transfer_learning':
            self.model, _ = self.create_transfer_learning_model()
        elif model_type == 'ensemble':
            self.model = self.create_ensemble_model()
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        # Compile the model
        self.model = self.compile_model(self.model)
        
        logger.info(f"Built {model_type} model with {self.model.count_params()} parameters")
        
        return self.model
    
    def get_model_summary(self):
        """Get model summary"""
        if self.model is None:
            raise ValueError("Model not built yet. Call build_model() first.")
        
        return self.model.summary()

# Custom loss functions for better performance
class FocalLoss(tf.keras.losses.Loss):
    """Focal loss for handling class imbalance"""
    
    def __init__(self, alpha=0.25, gamma=2.0, **kwargs):
        super().__init__(**kwargs)
        self.alpha = alpha
        self.gamma = gamma
    
    def call(self, y_true, y_pred):
        epsilon = tf.keras.backend.epsilon()
        y_pred = tf.clip_by_value(y_pred, epsilon, 1. - epsilon)
        
        p_t = tf.where(tf.equal(y_true, 1), y_pred, 1 - y_pred)
        alpha_factor = tf.ones_like(y_true) * self.alpha
        alpha_t = tf.where(tf.equal(y_true, 1), alpha_factor, 1 - alpha_factor)
        
        cross_entropy = -tf.math.log(p_t)
        weight = alpha_t * tf.pow((1 - p_t), self.gamma)
        
        focal_loss = weight * cross_entropy
        return tf.reduce_mean(tf.reduce_sum(focal_loss, axis=1))

# Custom metrics
class F1Score(tf.keras.metrics.Metric):
    """F1 Score metric"""
    
    def __init__(self, name='f1_score', **kwargs):
        super().__init__(name=name, **kwargs)
        self.precision = tf.keras.metrics.Precision()
        self.recall = tf.keras.metrics.Recall()
    
    def update_state(self, y_true, y_pred, sample_weight=None):
        self.precision.update_state(y_true, y_pred, sample_weight)
        self.recall.update_state(y_true, y_pred, sample_weight)
    
    def result(self):
        precision = self.precision.result()
        recall = self.recall.result()
        return 2 * ((precision * recall) / (precision + recall + tf.keras.backend.epsilon()))
    
    def reset_state(self):
        self.precision.reset_state()
        self.recall.reset_state()

if __name__ == "__main__":
    # Example usage
    model_builder = PestDetectionModel()
    model = model_builder.build_model('advanced_cnn')
    print(model_builder.get_model_summary())