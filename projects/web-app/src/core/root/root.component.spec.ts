import { RootComponent } from '@/core';
import { RootHarness } from '@/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

describe('RootComponent', () => {
    @Component({
        selector: 'app-test',
        template: `<app-root />`,
        imports: [RootComponent],
    })
    class TestComponent {}

    async function setupTest() {
        TestBed.configureTestingModule({
            imports: [TestComponent],
        });

        const harnessLoader = TestbedHarnessEnvironment.loader(TestBed.createComponent(TestComponent));

        return {
            harness: await harnessLoader.getHarness(RootHarness),
        };
    }

    it('should render title', async () => {
        const { harness } = await setupTest();

        expect(await harness.getTitleContents()).toEqual('root works!');
    });
});
