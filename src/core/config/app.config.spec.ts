import { RootHarness } from '@/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { RootComponent } from '../root/root.component';
import { appConfig } from './app.config';

describe('appConfig', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RootComponent],
            providers: appConfig.providers,
        });
    });

    it('provides what the root component needs to render', async () => {
        const fixture = TestBed.createComponent(RootComponent);
        const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RootHarness);

        expect(await harness.hasRouterOutlet()).toBe(true);
    });
});
