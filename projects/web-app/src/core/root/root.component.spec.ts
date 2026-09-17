import { RootComponent } from '@/core';
import { RootHarness } from '@/core/testing';
import { setupTestEnvironment } from '@/testing';
import { Component } from '@angular/core';

describe('RootComponent', () => {
    @Component({
        selector: 'app-test',
        template: `<app-root />`,
        imports: [RootComponent],
    })
    class TestComponent {}

    async function setupTest() {
        const { harness } = await setupTestEnvironment({ testComponent: TestComponent, harness: RootHarness });

        return {
            harness: harness,
        };
    }

    it('should render title', async () => {
        const { harness } = await setupTest();
        expect(await harness.titleContents()).toEqual('root works!');
    });

    it('should render the top bar', async () => {
        const { harness } = await setupTest();
        expect(await harness.hasTopBar()).toBe(true);
    });
});
