<template>
    <div>
        <label>Search settings (Test)</label>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <div v-on="on">
                    <v-checkbox :disabled="disabled" v-model="equateIlModel" label="Equate I and L" hide-details>
                        <span slot="label" v-on="on">Equate I and L</span>
                    </v-checkbox>
                </div>
            </template>
            <span>Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-checkbox v-on="on" :disabled="disabled" v-model="filterDuplicatesModel" hide-details>
                    <span slot="label" v-on="on">Filter duplicate peptides</span>
                </v-checkbox>
            </template>
            <span>Remove duplicate peptides from the input before searching.</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-checkbox v-on="on" :disabled="disabled" v-model="missingCleavageModel" hide-details>
                    <span slot="label" v-on="on">Advanced missing cleavage handling</span>
                </v-checkbox>
            </template>
            <span>Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!</span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    // @Component({
    //     components: {},
    //     computed: {
    //         equateIlModel: {
    //             get() {
    //                 return this.equateIl;
    //             },
    //             set(val) {
    //                 this.equateIlData = val;
    //                 this.$emit('equate-il-change', val);
    //             }
    //         },
    //         filterDuplicatesModel: {
    //             get(): boolean {
    //                 return this.filterDuplicates;
    //             },
    //             set(val: boolean) {
    //                 this.filterDuplicatesData = val;
    //                 this.$emit('filter-duplicates-change', val);
    //             }
    //         },
    //         missingCleavageModel: {
    //             get() {
    //                 return this.missingCleavage;
    //             },
    //             set(val) {
    //                 this.missingCleavageData = val;
    //                 this.$emit('missing-cleavage-change', val);
    //             }
    //         }
    //     }
    // })
    @Component
    export default class SearchSetingsForm extends Vue {
        @Prop({default: false}) disabled!: boolean;
        @Prop({default: true}) equateIl!: boolean;
        @Prop({default: true}) filterDuplicates!: boolean;
        @Prop({default: false}) missingCleavage!: boolean;

        equateIlData: boolean = this.equateIl;
        filterDuplicatesData: boolean = this.filterDuplicates;
        missingCleavageData: boolean = this.missingCleavage;

        equateIlModel: boolean = true;
        filterDuplicatesModel: boolean = true;
        missingCleavageModel: boolean = false;

        @Watch('equateIl') onEquateIlChanged() {
            this.equateIlData = this.equateIl;
        }

        @Watch('filterDuplicates') onFilterDuplicatesChanged() {
            this.filterDuplicatesData = this.filterDuplicates;
        }

        @Watch('missingCleavage') onMissingCleavageChanged() {
            this.missingCleavageData = this.missingCleavage;
        }
    }
</script>

<style scoped>

</style>
