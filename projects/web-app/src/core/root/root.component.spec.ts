import { RootComponent } from '@/core';
import { RootHarness } from '@/core/testing';
import { setupTestEnvironment } from '@/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('RootComponent', () => {
    /** Hosts the component under test the way a page would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-root />`,
        imports: [RootComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through. The shell renders an outlet, so the
     * router is provided; which page it resolves to is the application's routing rather than the shell's, and is
     * covered by an end-to-end test.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({
            testComponent: TestComponent,
            harness: RootHarness,
            providers: [provideRouter([])],
        });

        return {
            harness: harness,
        };
    }

    it('should render the top bar', async () => {
        const { harness } = await setupTest();
        expect(await harness.hasTopBar()).toBe(true);
    });

    it('should render the current page in its main region', async () => {
        const { harness } = await setupTest();
        expect(await harness.hasPageOutlet()).toBe(true);
    });
});
