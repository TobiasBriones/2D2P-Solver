/*
 * Copyright (c) 2019-2020 Tobias Briones. All rights reserved.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This file is part of 2DP Repsymo Solver.
 *
 * 2DP Repsymo Solver is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 2DP Repsymo Solver is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 2DP Repsymo Solver.  If not, see <https://www.gnu.org/licenses/>.
 */

// Experimental model for now
export interface IMOption {
  cost: number,
  revenue: number
}

export interface IMPlan {
  id: number,
  options: IMOption[]
}

export interface Model {
  numberOfPlans: number,
  numberOfOptions: number,
  budget: number
  plans: IMPlan[]
}

export interface StageRow {
  budget: number,
  revenue: number[],
  f: number,
  option: number
}

export interface Stage {
  id: number,
  rows: StageRow[]
}

export class IMSolver {

  // IMOption is validated when solving to avoid over iterations
  public static validateModel(model: Model): boolean {
    return model.numberOfPlans > 0
      && model.numberOfOptions > 0
      && model.budget >= 0
      && model.plans.length == model.numberOfPlans
      && model.plans.filter(v => v.options.length != model.numberOfOptions).length == 0;
  }

  private model: Model;
  private stages: Stage[];
  private path: number[];

  constructor() {
    this.reset();
  }

  public getStages(): Stage[] {
    return this.stages;
  }

  public getPath(): number[] {
    return this.path;
  }

  public solve(problemModel: Model) {
    if (!IMSolver.validateModel(problemModel)) {
      throw new Error('Invalid investment model');
    }
    const initStages = () => {
      this.stages = [];

      for (let i = 0; i < problemModel.numberOfOptions; i++) {
        const rows: StageRow[] = [];
        const addRow = (budget: number) => {
          const revenue: number[] = Array(problemModel.numberOfPlans).fill(-1);

          rows.push({
            budget: budget,
            revenue: revenue,
            f: 0,
            option: 0
          });
        };

        // Fill the stage rows
        if ((i + 1) < problemModel.numberOfOptions) {
          for (let budget = 0; budget <= problemModel.budget; budget++) {
            addRow(budget);
          }
        }
        else {
          addRow(problemModel.budget);
        }
        this.stages.push({
          id: i,
          rows: rows
        });
      }
    };
    const solveStages = () => {
      this.stages.forEach(stage => this.solveStage(stage));
    };
    this.reset();
    this.model = problemModel;

    initStages();
    solveStages();
    this.createPath();
  }

  private reset() {
    this.model = null;
    this.stages = [];
    this.path = [];
  }

  private isAvailableOption(option: IMOption): boolean {
    return option.cost >= 0 && option.revenue >= 0;
  }

  private solveStage(stage: Stage) {
    const getFormerRevenue = (budget: number, plan: IMOption): number => {
      if (stage.id == 0) {
        return 0;
      }
      const remaining = budget - plan.cost;
      return this.stages[stage.id - 1].rows[remaining].f;
    };

    stage.rows.forEach(row => {
      const investmentOption = stage.id;
      const budget = row.budget;
      const options = row.revenue;
      let max = -1;
      let bestPlan = -1;

      // Each option is the revenue value gotten if the corresponding plan is possible
      // for the problem, -1 otherwise
      options.forEach((_option, i) => {
        const plan = this.model.plans[i].options[investmentOption];

        if (plan.cost == -1 || plan.cost > budget) {
          row.revenue[i] = -1;
          return;
        }
        const totalRevenue = getFormerRevenue(budget, plan) + plan.revenue;
        row.revenue[i] = totalRevenue;

        if (totalRevenue > max) {
          max = totalRevenue;
          bestPlan = i;
        }
      });
      row.f = max;
      row.option = bestPlan;
    });
  }

  private createPath() {
    const lastStageIndex = this.stages.length - 1;
    let moneyLeft = this.model.budget;
    let lastOption = -1;

    lastOption = this.stages[lastStageIndex].rows[0].option;
    moneyLeft = moneyLeft - this.model.plans[lastOption].options[lastStageIndex].cost;

    this.path.push(lastOption + 1);
    for (let i = this.stages.length - 2; i >= 0; i--) {
      const stage = this.stages[i];
      lastOption = stage.rows[moneyLeft].option;
      moneyLeft = moneyLeft - this.model.plans[lastOption].options[i].cost;

      this.path.push(lastOption + 1);
    }
    this.path.reverse();
  }

}
