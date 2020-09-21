import { browser, WebElement } from 'protractor';

export const e2eBrowserSleepMillis = 1000;
export const slowTypeDelayDefault = 100;

export async function navigateToPage(page: any) {
    await page.navigateTo();
    await browser.waitForAngular();
    return page;
}

export async function click(element: WebElement, offset?: any) {
    await browser.actions().mouseMove(element, offset).perform();
    await browser.actions().click(element, offset).perform();
    await browser.sleep(e2eBrowserSleepMillis);
    return element;
}

export async function slowType(element: WebElement, keys: string, delay?: number) {
    if (!delay) {
        delay = slowTypeDelayDefault;
    }
    await browser.actions().mouseMove(element).perform();
    await browser.actions().click(element).perform();

    for (const key of keys) {
        await element.sendKeys(key);
        await browser.sleep(delay);
    }
}

export async function repeatKey(element: WebElement, key: string, times?: number, delay?: number) {
    if (!times) {
        times = (await element.getAttribute('value')).length + 1;
    }
    if (!delay) {
        delay = slowTypeDelayDefault;
    }

    for (let i = 0; i < times; i++) {
        await element.sendKeys(key);
        await browser.sleep(delay);
    }
}

export async function getAttribute(element: WebElement, attributeName: string) {
    return await element.getAttribute(attributeName);
}

export async function getClassAttribute(element: WebElement) {
    return await this.getAttribute(element, 'class');
}

export async function getDisabledAttribute(element: WebElement) {
    return await this.getAttribute(element, 'disabled');
}

export async function getElementText(element: WebElement) {
    return await element.getText();
}

export async function clearLocalStorage() {
    await browser.executeScript('localStorage.clear();');
}
