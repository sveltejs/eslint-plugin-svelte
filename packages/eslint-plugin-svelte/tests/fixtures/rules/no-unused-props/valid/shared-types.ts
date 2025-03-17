export interface BaseProps {
	name: string;
	age: number;
}

export interface FooDTO {
	foo: string;
	bar: number;
	baz: BazDTO;
}

interface BazDTO {
	qux: string;
	quux: number;
}
