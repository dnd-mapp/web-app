import { TopBarComponent } from '@/components';
import { TopBarHarness } from '@/components/testing';
import { setupTestEnvironment } from '@/testing';
import { Component } from '@angular/core';

describe('TopBarComponent', () => {
    @Component({
        selector: 'app-test',
        template: `<app-top-bar />`,
        imports: [TopBarComponent],
    })
    class TestComponent {}

    async function setupTest() {
        const { harness } = await setupTestEnvironment({ testComponent: TestComponent, harness: TopBarHarness });

        return {
            harness: harness,
        };
    }

    it('should render an empty bar', async () => {
        const { harness } = await setupTest();
        expect(await harness.contents()).toEqual('');
    });
});
