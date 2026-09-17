import { TopBarComponent } from '@/components';
import { TopBarHarness } from '@/components/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('TopBarComponent', () => {
    @Component({
        selector: 'app-test',
        template: `<app-top-bar />`,
        imports: [TopBarComponent],
    })
    class TestComponent {}

    async function setupTest() {
        TestBed.configureTestingModule({
            imports: [TestComponent],
        });

        const harnessLoader = TestbedHarnessEnvironment.loader(TestBed.createComponent(TestComponent));

        return {
            harness: await harnessLoader.getHarness(TopBarHarness),
        };
    }

    it('should render an empty bar', async () => {
        const { harness } = await setupTest();
        expect(await harness.contents()).toEqual('');
    });
});
