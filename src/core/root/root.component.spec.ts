import { RootHarness } from '@/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RootComponent } from './root.component';

describe('RootComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RootComponent],
            providers: [provideRouter([])],
        });
    });

    it('renders the router outlet', async () => {
        const fixture = TestBed.createComponent(RootComponent);
        const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RootHarness);

        expect(await harness.hasRouterOutlet()).toBe(true);
    });
});
