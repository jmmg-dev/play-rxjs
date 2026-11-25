import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

describe('Icon', () => {
  const render = (name: string, size?: number) => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', name);
    if (size) fixture.componentRef.setInput('size', size);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('draws the path of a known icon, hidden from assistive technology', () => {
    const host = render('heart');
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('path')?.getAttribute('d')).toMatch(/^M19 14/);
  });

  it('uses 18px by default and the given size otherwise', () => {
    expect(render('github').querySelector('svg')?.getAttribute('width')).toBe('18');
    expect(render('github', 24).querySelector('svg')?.getAttribute('height')).toBe('24');
  });

  it('renders an empty path for unknown names', () => {
    expect(render('does-not-exist').querySelector('path')?.getAttribute('d')).toBe('');
  });
});
