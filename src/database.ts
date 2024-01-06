import {getLogger, Driver, MetadataAuthService, getSACredentialsFromJson, IamAuthService, IAuthService} from 'ydb-sdk';

export const logger = getLogger();
export let driver: Driver;

export const initDatabase = async () => {
  logger.info('Driver initializing...');
  let local = false;

  if (!process.env.ENDPOINT) {
    const dotenv = await import('dotenv');
    dotenv.config();
    local = true;
  }

  let authService: IAuthService;
  if (local) {
    const saKeyFile = process.env.SA_KEY_FILE;
    const saCredentials = getSACredentialsFromJson('./' + saKeyFile);
    authService = new IamAuthService(saCredentials);
  } else {
    authService = new MetadataAuthService();
  }

  driver = new Driver({ endpoint: process.env.ENDPOINT, database: process.env.DATABASE, authService });
  const timeout = 10000;
  if (!(await driver.ready(timeout))) {
    logger.fatal(`Driver has not become ready in ${timeout}ms!`);
    process.exit(1);
  }
  logger.info('Driver ready');
}
