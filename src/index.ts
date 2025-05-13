import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import contentRoutes from './routes/content.routes';
import membershipRoutes from './routes/membership.routes';
import interactionRoutes from './routes/interaction.routes';
import analyticsRoutes from './routes/analytics.routes';

import { ApiError } from './utils/api-error';
import { errorHandlerMiddleware } from './middlewares/error.middleware';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const swaggerDocument = YAML.load('./swagger.yaml');

// Routes
app.use('/auth', authRoutes);
app.use('/business', businessRoutes);
app.use('/content', contentRoutes);
app.use('/memberships', membershipRoutes);
app.use('/interactions', interactionRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use((_req, _res, next) => {
  next(new ApiError('Route not found', 404));
});

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
