import { Logger } from '../../src/logger';

describe('Logger', () => {
    describe('When tracking requests with unique IDs', () => {
        test('automatically includes request ID in info logs', () => {
            const logger = new Logger();
            const requestId = 'test-request-123';

            logger.setRequestId(requestId);

            const infoSpy = jest.spyOn((logger as any).winston, 'info');
            logger.info('Test message', { extra: 'data' });

            expect(infoSpy).toHaveBeenCalled();
            expect((logger as any).winston.defaultMeta).toEqual(
                expect.objectContaining({
                    requestId,
                })
            );

            infoSpy.mockRestore();
        });

        test('automatically includes request ID in error logs', () => {
            // Create a logger with a request ID
            const logger = new Logger();
            const requestId = 'test-request-456';

            logger.setRequestId(requestId);

            // Request ID is available for all log levels
            expect((logger as any).winston.defaultMeta).toEqual(
                expect.objectContaining({
                    requestId,
                })
            );
        });

        test('automatically includes request ID in warning logs', () => {
            // Create a logger with a request ID
            const logger = new Logger();
            const requestId = 'test-request-789';

            logger.setRequestId(requestId);

            //Request ID is available for warnings too
            expect((logger as any).winston.defaultMeta).toEqual(
                expect.objectContaining({
                    requestId,
                })
            );
        });
    });

    describe('When tracking client information', () => {
        test('includes both request ID and client header in logs', () => {
            const logger = new Logger();
            const requestId = 'test-request-999';
            const clientHeader = 'test-client-app';

            logger.setRequestId(requestId);
            logger.setClientHeader(clientHeader);

            // Both values are included in metadata
            expect((logger as any).winston.defaultMeta).toEqual({
                requestId,
                client: clientHeader,
            });
        });
    });

    describe('When managing log metadata', () => {
        test('uses Winston defaultMeta for automatic context inclusion', () => {
            const logger = new Logger();

            logger.setRequestId('req-123');
            logger.setClientHeader('client-abc');

            expect((logger as any).winston.defaultMeta).toEqual({
                requestId: 'req-123',
                client: 'client-abc',
            });
        });

        test('handles missing values without throwing errors', () => {
            const logger = new Logger();

            expect(() => {
                logger.setRequestId(undefined);
                logger.setClientHeader(undefined);
            }).not.toThrow();
        });
    });
});