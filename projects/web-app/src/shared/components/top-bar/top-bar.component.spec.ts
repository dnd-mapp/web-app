import { Component } from '@angular/core';
import { TopBarComponent } from '@dnd-mapp/shared/components';
import { TopBarHarness } from '@dnd-mapp/shared/components/testing';
import { setupTestEnvironment } from '@dnd-mapp/shared/testing';

describe('TopBarComponent', () => {
    /** Hosts the component under test the way a page would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-top-bar
            ><span ngProjectAs="[brand]">Application name</span
            ><span ngProjectAs="[actions]">Account actions</span></app-top-bar
        >`,
        imports: [TopBarComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({ testComponent: TestComponent, harness: TopBarHarness });

        return {
            harness: harness,
        };
    }

    it('should render the content given to its brand slot', async () => {
        const { harness } = await setupTest();
        expect(await harness.brandContents()).toEqual('Application name');
    });

    it('should render the content given to its actions slot', async () => {
        const { harness } = await setupTest();
        expect(await harness.actionContents()).toEqual('Account actions');
    });
});
