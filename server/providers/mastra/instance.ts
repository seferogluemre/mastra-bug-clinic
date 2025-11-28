
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { clinicAgent } from './agents/main';
import { storage } from './components/storage';

export const mastra = new Mastra({
  agents: { clinicAgent },
  storage: storage,
  logger: new PinoLogger({
    name: 'Mastra Clinic',
    level: 'info',
  }),
  telemetry: {
    enabled: false,
  },
  observability: {
    default: { enabled: true },
  },
});