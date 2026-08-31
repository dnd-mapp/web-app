import { RootHarness } from '@/app/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RootComponent } from './root.component';

describe('RootComponent', () => {
    @Component({
        selector: 'app-test',
        template: '<app-root />',
        imports: [RootComponent],
    })
    class TestComponent {}

    async function setupTest() {
        TestBed.configureTestingModule({
            imports: [TestComponent],
        });

        const fixture = TestBed.createComponent(TestComponent);
        const harnessLoader = TestbedHarnessEnvironment.loader(fixture);

        return {
            harness: await harnessLoader.getHarness(RootHarness),
        };
    }

    it('should render title', async () => {
        const { harness } = await setupTest();

        expect(await harness.titleText()).toEqual('Hello, web-app');
    });
});
