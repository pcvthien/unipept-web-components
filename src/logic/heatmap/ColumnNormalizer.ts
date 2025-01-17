import {Normalizer} from './Normalizer';

export default class ColumnNormalizer implements Normalizer {
    public normalize(data: number[][]): number[][] {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        const output: number[][] = [];

        for (const _ of data) {
            output.push([]);
        }

        for (let col = 0; col < data[0].length; col++) {
            // Find the minimum and maximum value by iterating over every value in the current column
            const minMax: number[] = Array.from(
                Array(data[0].length).keys())
                    .map(
                        (row) => data[row][col]).reduce((acc, current) => [Math.min(acc[0], current),
                        Math.max(acc[1], current)], [Infinity, -Infinity],
                    );
            const min = minMax[0];
            const max = minMax[1];

            for (let row = 0; row < data.length; row++) {
                if (max - min !== 0) {
                    output[row].push((data[row][col] - min) / (max - min));
                } else {
                    output[row].push(0);
                }
            }
        }

        return output;
    }
}
