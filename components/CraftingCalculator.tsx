

import React, { useState, useMemo, useCallback } from 'react';
import { CRAFTING_RECIPES_DATA } from '../data';
import { CraftingData } from '../types';
import { CubeIcon } from './CubeIcon';

type CalculatedMaterials = { [key: string]: number };

export const CraftingCalculator: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [calculatedMaterials, setCalculatedMaterials] = useState<CalculatedMaterials>({});

    const groupedRecipes = useMemo(() => {
        // Fix: Explicitly type the accumulator for `reduce` with a generic to prevent
        // type inference issues downstream, which caused the 'items' variable to be 'unknown'.
        return Object.entries(CRAFTING_RECIPES_DATA).reduce<Record<string, string[]>>((acc, [name, recipe]) => {
            if (!acc[recipe.category]) {
                acc[recipe.category] = [];
            }
            acc[recipe.category].push(name);
            return acc;
        }, {});
    }, []);

    const calculateTotalMaterials = useCallback((itemName: string, amount: number, recipes: CraftingData): CalculatedMaterials => {
        const totals: CalculatedMaterials = {};

        const findMaterials = (item: string, num: number) => {
            // If the item is a craftable recipe
            if (recipes[item]) {
                recipes[item].materials.forEach(material => {
                    findMaterials(material.name, material.quantity * num);
                });
            } else {
                // If it's a base material
                if (!totals[item]) {
                    totals[item] = 0;
                }
                totals[item] += num;
            }
        };

        findMaterials(itemName, amount);
        return totals;
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || quantity <= 0) {
            setCalculatedMaterials({});
            return;
        }
        const results = calculateTotalMaterials(selectedItem, quantity, CRAFTING_RECIPES_DATA);
        setCalculatedMaterials(results);
    };
    
    const handleClear = () => {
        setSelectedItem('');
        setQuantity(1);
        setCalculatedMaterials({});
    };

    const hasResults = Object.keys(calculatedMaterials).length > 0;

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side: Controls */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-4">Calculadora de Crafting</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="item-select" className="block text-sm font-medium text-slate-400 mb-1">
                                Item para Fabricar
                            </label>
                            <select
                                id="item-select"
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 py-2 px-3"
                            >
                                <option value="" disabled>Selecione um item...</option>
                                {/* Fix: Explicitly cast entries to [string, string[]][] to ensure 'items' is correctly typed as string[] and not unknown. */}
                                {(Object.entries(groupedRecipes) as [string, string[]][]).map(([category, items]) => (
                                    <optgroup label={category} key={category}>
                                        {items.sort().map(item => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="quantity-input" className="block text-sm font-medium text-slate-400 mb-1">
                                Quantidade
                            </label>
                            <input
                                type="number"
                                id="quantity-input"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                min="1"
                                className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 py-2 px-3"
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                             <button type="submit" className="w-full bg-cyan-500 text-slate-900 font-bold py-2 px-4 rounded-md hover:bg-cyan-400 transition-colors shadow-lg">
                                Calcular Materiais
                            </button>
                            <button type="button" onClick={handleClear} className="w-full bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors">
                                Limpar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right side: Results */}
                <div className={`transition-opacity duration-500 ${hasResults ? 'opacity-100' : 'opacity-50'}`}>
                    <h3 className="text-xl font-semibold text-slate-100 border-b border-slate-700 pb-2 mb-4">
                        Materiais Necessários
                    </h3>
                    {hasResults ? (
                        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                           {/* Fix: Explicitly cast entries to [string, number][] to ensure 'total' is correctly typed as a number and not unknown. */}
                           {(Object.entries(calculatedMaterials) as [string, number][])
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([name, total]) => (
                                <li key={name} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <CubeIcon className="w-5 h-5 text-cyan-400" />
                                        <span className="text-slate-200 font-medium">{name}</span>
                                    </div>
                                    {/* Fix: Use Intl.NumberFormat for robust localization, which also resolves the "Expected 0 arguments, but got 1" error. */}
                                    <span className="font-mono text-emerald-400 font-bold">{new Intl.NumberFormat('pt-BR').format(total)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-center">
                            <p>Selecione um item e a quantidade para ver os materiais necessários.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};