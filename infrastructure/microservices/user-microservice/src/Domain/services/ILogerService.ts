export interface ILogerService {
    log(message: string): Promise<boolean>;
}