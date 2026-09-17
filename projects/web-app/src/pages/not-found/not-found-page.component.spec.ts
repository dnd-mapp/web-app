import { NotFoundPageComponent } from '@/pages';
import { NotFoundPageHarness } from '@/pages/testing';
import { setupTestEnvironment } from '@/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('NotFoundPageComponent', () => {
    /** Hosts the component under test the way the router would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-not-found-page />`,
        imports: [NotFoundPageComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through. The page links back to the home
     * page, so the router is provided.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({
            testComponent: TestComponent,
            harness: NotFoundPageHarness,
            providers: [provideRouter([])],
        });

        return {
            harness: harness,
        };
    }

    it('should say the page does not exist', async () => {
        const { harness } = await setupTest();
        expect(await harness.titleContents()).toEqual('Page not found');
    });

    it('should say what happened to it', async () => {
        const { harness } = await setupTest();
        expect(await harness.introContents()).toEqual('The page you were looking for does not exist or has moved.');
    });

    it('should offer a way back to the home page', async () => {
        const { harness } = await setupTest();
        expect(await harness.homeLinkContents()).toEqual('Go to the home page');
    });
});
