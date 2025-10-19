
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { clinicAgent } from './agents/clinic-agent';

export const mastra = new Mastra({
  agents: { clinicAgent },
  storage: new LibSQLStore({
    url: 'file:./mastra-storage.db',
  }),
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