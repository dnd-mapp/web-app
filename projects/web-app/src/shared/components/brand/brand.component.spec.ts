import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrandComponent } from '@dnd-mapp/shared/components';
import { BrandHarness } from '@dnd-mapp/shared/components/testing';
import { setupTestEnvironment } from '@dnd-mapp/shared/testing';

describe('BrandComponent', () => {
    /** Hosts the component under test the way a page would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-brand />`,
        imports: [BrandComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through. The wordmark is a link, so the router
     * is provided; which page the root path resolves to is the application's routing rather than the wordmark's, and
     * is covered by an end-to-end test.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({
            testComponent: TestComponent,
            harness: BrandHarness,
            providers: [provideRouter([])],
        });

        return {
            harness: harness,
        };
    }

    it("should show the application's name", async () => {
        const { harness } = await setupTest();
        expect(await harness.name()).toBe('D&D Mapp');
    });

    it('should lead to the home page', async () => {
        const { harness } = await setupTest();
        expect(await harness.destination()).toBe('/');
    });
});
