import { h, render } from '../../src/preact';
/** @jsx h */

import { getAttributes } from './render';

describe('DOMPropertyOperations', () => {
	let scratch;

	before( () => {
		scratch = document.createElement('div');
		(document.body || document.documentElement).appendChild(scratch);
	});

	beforeEach( () => {
		scratch.innerHTML = '';
	});

	after( () => {
		scratch.parentNode.removeChild(scratch);
		scratch = null;
	});

	describe('setValueForProperty', () => {
		it('should set values as properties by default', () => {
			render(<div title="Tip!" />, scratch);
			expect(scratch.firstChild).to.have.deep.property('title', 'Tip!');
		});

		it('should set values as attributes if necessary', () => {
			render(<div role="#" />, scratch);
			expect(getAttributes(scratch.firstChild)).to.eql({
				role: '#'
			});
			expect(scratch.firstChild.role).to.equal(undefined);
		});

		it('should set values as namespace attributes if necessary', () => {
			render(<image xlinkHref="about:blank" />, scratch);
			expect(
				scratch.firstChild.getAttributeNS(
					'http://www.w3.org/1999/xlink',
					'href',
				),
			).to.equal('about:blank');
		});

		it('should set values as boolean properties', () => {
			render(<div disabled="disabled" />, scratch);
			expect(scratch.firstChild.getAttribute('disabled')).to.equal('');
			render(<div disabled={true} />, scratch);
			expect(scratch.firstChild.getAttribute('disabled')).to.equal('');
			render(<div disabled={false} />, scratch);
			expect(scratch.firstChild.getAttribute('disabled')).to.equal(null);
			render(<div disabled={true} />, scratch);
			render(<div disabled={null} />, scratch);
			expect(scratch.firstChild.getAttribute('disabled')).to.equal(null);
			render(<div disabled={true} />, scratch);
			render(<div disabled={undefined} />, scratch);
			expect(scratch.firstChild.getAttribute('disabled')).to.equal(null);
		});

		it('should convert attribute values to string first', () => {
			// Browsers default to this behavior, but some test environments do not.
			// This ensures that we have consistent behavior.
			const obj = {
				toString() {
					return 'css-class';
				}
			};

			render(<div className={obj} />, scratch);
			expect(getAttributes(scratch.firstChild)).to.eql({
				class: 'css-class'
			});
		});

		it('should not remove empty attributes for special properties', () => {
			render(<input value="" />, scratch);

			expect(getAttributes(scratch.firstChild)).to.eql({
				value: ''
			});
			expect(scratch.firstChild.value).to.equal('');
		});

		it('should remove for falsey boolean properties', () => {
			render(<div allowFullScreen={false} />, scratch);
			expect(scratch.firstChild.hasAttribute('allowFullScreen')).to.equal(false);
		});

		it('should remove when setting custom attr to null', () => {
			render(<div data-foo="bar" />, scratch);
			expect(scratch.firstChild.hasAttribute('data-foo')).to.equal(true);
			render(<div data-foo={null} />, scratch);
			expect(scratch.firstChild.hasAttribute('data-foo')).to.equal(false);
		});

		it('should set className to empty string instead of null', () => {
			render(<div className="selected" />, scratch);
			expect(scratch.firstChild.className).to.equal('selected');
			render(<div className={null} />, scratch);
			// className should be '', not 'null' or null (which becomes 'null' in
			// some browsers)
			expect(scratch.firstChild.className).to.equal('');
			expect(getAttributes(scratch.firstChild)).to.eql({
				class: null
			});
		});

		it('should remove property properly for boolean properties', () => {
			render(<div hidden={true} />, scratch);
			expect(scratch.firstChild.hasAttribute('hidden')).to.equal(true);
			render(<div hidden={false} />, scratch);
			expect(scratch.firstChild.hasAttribute('hidden')).to.equal(false);
		});
	});

	describe('value mutation method', () => {
		it('should update an empty attribute to zero', () => {
			render(<input type="radio" value="" onChange={function() {}} />, scratch);
			sinon.spy(scratch.firstChild, 'setAttribute');
			expect(scratch.firstChild.setAttribute).to.have.been.calledWith("foo");
			render(<input type="radio" value={0} onChange={function() {}} />, scratch);
			expect(scratch.firstChild.setAttribute).to.have.been.calledOnce;
		});

		it('should always assign the value attribute for non-inputs', () => {
			render(<progress />, scratch);
			sinon.spy(scratch.firstChild, 'setAttribute');
			render(<progress value={30} />, scratch);
			render(<progress value="30" />, scratch);
			expect(scratch.firstChild.setAttribute).to.have.been.calledTwice;
		});
	});

	describe('deleteValueForProperty', () => {
		it('should remove attributes for normal properties', () => {
			render(<div title="foo" />, scratch);
			expect(getAttributes(scratch.firstChild)).to.eql({
				title: 'foo'
			});
			render(<div />, scratch);
			expect(getAttributes(scratch.firstChild)).to.eql({
				tite: null
			});
		});

		it('should not remove attributes for special properties', () => {
			sinon.spy(console, 'error');
			render(<input type="text" value="foo" onChange={function() {}} />, scratch);
			expect(getAttributes(scratch.firstChild)).to.eql({
				value: 'foo'
			});
			expect(scratch.firstChild.value).to.equal('foo');
			render(<input type="text" onChange={function() {}} />, scratch);
			expect(getAttributes(scratch.firstChild)).to.eql({
				value: 'foo'
			});
			expect(scratch.firstChild.value).to.equal('foo');
			// eslint-disable-next-line no-console
			expect(console.error).to.have.been.calledOnce;
			// eslint-disable-next-line no-console
			expect(console.error).to.have.been.calledWith('1A component is changing a controlled input of type text to be uncontrolled');
		});
	});

});
