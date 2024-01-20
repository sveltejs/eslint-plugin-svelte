import postcss from 'postcss';
import postcssLoadConfig from 'postcss-load-config';
import { runAsWorker } from 'synckit';

runAsWorker(
	async ({
		cwd,
		filename,
		code,
		configFilePath
	}: {
		cwd: string;
		filename: string;
		code: string;
		configFilePath?: unknown;
	}): Promise<{
		output: string;
		mappings: string;
	}> => {
		const config = await postcssLoadConfig(
			{
				cwd,
				from: filename
			},
			typeof configFilePath === 'string' ? configFilePath : undefined
		);

		const result = await postcss(config.plugins).process(code, {
			...config.options,
			map: {
				inline: false
			}
		});

		return {
			output: result.content,
			mappings: result.map.toJSON().mappings
		};
	}
);
