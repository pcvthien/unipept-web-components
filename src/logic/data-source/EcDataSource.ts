import EcNumber from '../functional-annotations/EcNumber';
import { EcNameSpace, convertEcNumberToEcNameSpace } from '../functional-annotations/EcNameSpace';
import FATrust from '../functional-annotations/FATrust';
import { MPAFAResult } from '../data-management/newworker.js';
import { CachedDataSource } from './CachedDataSource';
// import TreeViewNode from '../ui/visualizations/TreeViewNode';

export default class EcDataSource extends CachedDataSource<EcNameSpace, EcNumber> {
    /**
     * Retrieve the top n EC-Numbers for a specific namespace. If the namespace is not specified (null), the resulting
     * EC-Numbers will not be restricted to a specific namespace.
     *
     * @param n The amount of EC-numbers that should be returned. If n is bigger than the amount of EC-Numbers available
     * all available numbers will be returned and the result will contain less than n numbers.
     * @param namespace The EC namespace to which the returned results should belong. Leave blanco if no filtering
     * should be performed.
     * @return A list of EC-Numbers, sorted by popularity.
     */
    public async getTopItems(n: number, namespace: EcNameSpace = null): Promise<EcNumber[]> {
        if (namespace) {
            const result: [EcNumber[], FATrust] = await this.getFromCache(namespace, Object.values(EcNameSpace));
            return result[0].slice(0, Math.min(n, result[0].length));
        } else {
            const output: EcNumber[] = [];
            for (const ns of Object.values(EcNameSpace)) {
                const result: [EcNumber[], FATrust] = await this.getFromCache(ns, Object.values(EcNameSpace));
                if (result && result[0] && result[0].length > 0) {
                    output.push(...result[0].slice(0, Math.min(n, result[0].length)));
                }
            }

            return output.sort((a: EcNumber, b: EcNumber) => b.popularity - a.popularity).slice(0, Math.min(n, output.length));
        }
    }

    /**
     * Returns a list of EC-Numbers that satisfy the given filtering requirements.
     *
     * @param namespace The EC-Namespace to which all returned EC-Numbers should belong. If this is null, EC-Numbers
     * from all namespaces will be returned.
     * @param cutoff
     * @param sequences
     */
    public async getEcNumbers(namespace: EcNameSpace = null, cutoff: number = 50, sequences: string[] = null): Promise<EcNumber[]> {
        if (namespace) {
            const result: [EcNumber[], FATrust] = await this.getFromCache(namespace, Object.values(EcNameSpace), cutoff, sequences);
            return result[0];
        } else {
            const output: EcNumber[] = [];
            for (const ns of Object.values(EcNameSpace)) {
                const result: [EcNumber[], FATrust] = await this.getFromCache(ns, Object.values(EcNameSpace), cutoff, sequences);
                output.push(... result[0]);
            }
            output.sort((a: EcNumber, b: EcNumber) => b.popularity - a.popularity);
            return output;
        }
    }

    public async getTrust(namespace: EcNameSpace = null, cutoff: number = 50, sequences: string[] = null): Promise<FATrust> {
        if (namespace) {
            const result: [EcNumber[], FATrust] = await this.getFromCache(namespace, Object.values(EcNameSpace), cutoff, sequences);
            return result[1];
        } else {
            const trusts: FATrust[] = [];
            for (const ns of Object.values(EcNameSpace)) {
                const result: [EcNumber[], FATrust] = await this.getFromCache(ns, Object.values(EcNameSpace), cutoff, sequences);
                trusts.push(result[1]);
            }
            return this.agregateTrust(trusts);
        }
    }

    // TODO enable again later (once visualizations have been ported)
    // /**
    //  * Query the EC-datasource and directly convert the found results into an EC-tree.
    //  *
    //  * @param namespace
    //  * @param cutoff
    //  * @param sequences
    //  * @return A data model that can be used for a treeview.
    //  */
    // public async getEcTree(namespace: EcNameSpace = null, cutoff: number = 50, sequences: string[] = null): Promise<TreeViewNode> {
    //     const result: EcNumber[] = await this.getEcNumbers(namespace, cutoff, sequences);
    //     // Maps an EC-code onto a Node.
    //     const codeNodeMap: Map<string, TreeViewNode> = new Map();

    //     // Initialize the root node
    //     codeNodeMap.set('-.-.-.-', {
    //         id: 0,
    //         name: '-.-.-.-',
    //         children: [],
    //         data: {
    //             self_count: 0,
    //             count: 0,
    //             data: {
    //                 sequences: Object.create(null),
    //                 self_sequences: Object.create(null),
    //             },
    //         },
    //     });

    //     const getOrNew = (key) => {
    //         if (!codeNodeMap.has(key)) {
    //             codeNodeMap.set(key, {
    //                 id: key.split('.').map((x) => ('0000' + x).slice(-4)).join('.'),
    //                 name: key.split('.').filter((x) => x !== '-').join('.'),
    //                 children: [],
    //                 data: {self_count: 0, count: 0, data: {
    //                     code: key, value: 0,
    //                     sequences: Object.create(null),
    //                     self_sequences: Object.create(null),
    //                 }},
    //             });
    //             const ancestors = EcNumber.computeAncestors(key, true);
    //             getOrNew(ancestors[0]).children.push(codeNodeMap.get(key));
    //         }
    //         return codeNodeMap.get(key);
    //     };

    //     // Sort from generic to specific
    //     const sortedEC = result.sort((a: EcNumber, b: EcNumber) => a.level - b.level);

    //     for (const data of sortedEC) {
    //         const toInsert = {
    //             id: data.code.split('.').map((x) => ('0000' + x).slice(-4)).join('.'),
    //             name: data.code.split('.').filter((x) => x !== '-').join('.'),
    //             children: [],
    //             data: {
    //                 self_count: data.popularity,
    //                 count: data.popularity,
    //                 data,
    //             },
    //         };

    //         codeNodeMap.set(data.code, toInsert);

    //         const ancestors = EcNumber.computeAncestors(data.code, true);
    //         getOrNew(ancestors[0]).children.push(toInsert);
    //         for (const a of ancestors) {
    //             getOrNew(a).data.count += toInsert.data.count;
    //         }
    //     }

    //     // Order the nodes by their id (order by EC number)
    //     for (const val of codeNodeMap.values()) {
    //         val.children.sort((a, b) => a.id.localeCompare(b.id));
    //     }

    //     return codeNodeMap.get('-.-.-.-');
    // }

    protected async computeTerms(percent = 50, sequences = null): Promise<[Map<EcNameSpace, EcNumber[]>, Map<EcNameSpace, FATrust>]> {
        const worker = await this._repository.getWorker();

        const {data, trust} = await worker.summarizeEc(percent, sequences);
        const dataOutput: Map<EcNameSpace, EcNumber[]> = new Map();
        for (const namespace of Object.values(EcNameSpace)) {
            const items: MPAFAResult[] = data[namespace];
            const convertedItems: EcNumber[] = [];
            for (const item of items) {
                const affectedPeptides: string[] = [];
                for (const seq of Object.keys(item.sequences)) {
                    if (item.sequences.hasOwnProperty(seq)) {
                        for (let i = 0; i < item.sequences[seq]; i++) {
                            affectedPeptides.push(seq);
                        }
                    }
                }
                convertedItems.push(new EcNumber(item.code, item.name, namespace, item.numberOfPepts, item.fractionOfPepts, affectedPeptides));
            }
            dataOutput.set(namespace, convertedItems);
        }

        const trustOutput: Map<EcNameSpace, FATrust> = new Map();
        for (const namespace of Object.values(EcNameSpace)) {
            const originalTrust: {trustCount: number, annotatedCount: number, totalCount: number} = trust[namespace];
            const convertedTrust: FATrust = new FATrust(originalTrust.annotatedCount, originalTrust.totalCount, originalTrust.trustCount);
            trustOutput.set(namespace, convertedTrust);
        }

        return [dataOutput, trustOutput];
    }
}
