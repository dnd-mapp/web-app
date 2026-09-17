import { NotFoundPageComponent } from '@/pages';
import { NotFoundPageHarness } from '@/pages/testing';
import { Component, type Type } from '@angular/core';
import { provideRouter } from '@angular/router';
import { setupTestEnvironment } from '@dnd-mapp/web-ui/testing';

describe('NotFoundPageComponent', () => {
    /** Hosts the component under test the way a direct visit would, with no path carried onto it. */
    @Component({
        selector: 'app-test',
        template: `<app-not-found-page />`,
        imports: [NotFoundPageComponent],
    })
    class TestComponent {}

    /** Hosts the component the way the wildcard route's redirect would, with the path it could not match. */
    @Component({
        selector: 'app-redirected-test',
        template: `<app-not-found-page path="/campaigns/42" />`,
        imports: [NotFoundPageComponent],
    })
    class RedirectedTestComponent {}

    /**
     * Renders a host component and loads the harness a test asserts through. The page links back to the home page,
     * so the router is provided.
     *
     * @typeParam T The host component's class, inferred from the argument so a test reads the host's members typed.
     * @param testComponent The host component to render.
     * @returns The loaded harness.
     */
    async function setupTest<T>(testComponent: Type<T>) {
        const { harness } = await setupTestEnvironment({
            testComponent: testComponent,
            harness: NotFoundPageHarness,
            providers: [provideRouter([])],
        });

        return {
            harness: harness,
        };
    }

    it('should say the page does not exist', async () => {
        const { harness } = await setupTest(TestComponent);
        expect(await harness.titleContents()).toEqual('Page not found');
    });

    it('should say what happened to it', async () => {
        const { harness } = await setupTest(TestComponent);
        expect(await harness.introContents()).toEqual('The page you were looking for does not exist or has moved.');
    });

    it('should offer a way back to the home page', async () => {
        const { harness } = await setupTest(TestComponent);
        expect(await harness.homeLinkContents()).toEqual('Go to the home page');
    });

    it('should not name an attempted path when reached directly', async () => {
        const { harness } = await setupTest(TestComponent);
        expect(await harness.attemptedPathContents()).toBeNull();
    });

    it('should name the path a redirect carried onto it', async () => {
        const { harness } = await setupTest(RedirectedTestComponent);
        expect(await harness.attemptedPathContents()).toEqual('You tried to open /campaigns/42.');
    });
});
