import { injectable } from 'inversify';
import needle from 'needle';
import { FiringService } from '../../domain/ports/out/firing.service';

@injectable()
export class FiringServiceImpl implements FiringService {
    public async fire(url: string): Promise<null> {
        await needle('post', url, {});
        return null;
    }
}
