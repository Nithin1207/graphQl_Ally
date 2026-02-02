import winston from 'winston';


// I added Strict Encapsulation here, by using private properties
// and also i make sure that, when value changes the Winston defaultMeta is updated automatically -- because it is a core concept in OOP(object oriented Programming)


export class Logger {
  private winston: winston.Logger;
  private requestId: string = '';
  private client: string = '';

  constructor() {
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()],
    });
  }


  private updateDefaultMeta(): void {
    this.winston.defaultMeta = {
      requestId: this.requestId,
      client: this.client,
    };
  }


  setRequestId(requestId?: string): void {
    if (requestId) {
      this.requestId = requestId;
      this.updateDefaultMeta();
    }
  }


  setClientHeader(client?: string): void {
    if (client) {
      this.client = client;
      this.updateDefaultMeta();
    }
  }

  info(message: string, meta?: object): void {
    this.winston.info(message, meta);
  }

  error(message: string, meta?: object): void {
    this.winston.error(message, meta);
  }

  warn(message: string, meta?: object): void {
    this.winston.warn(message, meta);
  }
}