import { HomePageComponent, pageTexts } from '@/pages';
import { HomePageHarness } from '@/pages/testing';
import { Component } from '@angular/core';
import { setupTestEnvironment } from '@dnd-mapp/web-ui/testing';

describe('HomePageComponent', () => {
    /** Hosts the component under test the way the router would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-home-page />`,
        imports: [HomePageComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({
            testComponent: TestComponent,
            harness: HomePageHarness,
            texts: [pageTexts],
        });

        return {
            harness: harness,
        };
    }

    it('should say what the application is for', async () => {
        const { harness } = await setupTest();
        expect(await harness.titleContents()).toEqual('Your companion for tabletop D&D');
    });

    it('should say what the application does', async () => {
        const { harness } = await setupTest();
        expect(await harness.introContents()).toEqual('Manage characters, roll dice, and build maps and lore.');
    });
});
