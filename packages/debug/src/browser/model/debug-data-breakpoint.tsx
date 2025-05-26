// *****************************************************************************
// Copyright (C) 2019 TypeFox and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import * as React from '@theia/core/shared/react';
import { TreeElement } from '@theia/core/lib/browser/source-tree';
import { DataBreakpoint } from '../breakpoint/breakpoint-marker';
import { DebugBreakpoint, DebugBreakpointOptions, DebugBreakpointDecoration } from './debug-breakpoint';
import { BreakpointManager } from '../breakpoint/breakpoint-manager';
import { nls } from '@theia/core';
import { TREE_NODE_INFO_CLASS } from '@theia/core/lib/browser';

export class DebugDataBreakpoint extends DebugBreakpoint<DataBreakpoint> implements TreeElement {

    constructor(readonly origin: DataBreakpoint, options: DebugBreakpointOptions) {
        super(BreakpointManager.DATA_URI, options);
    }

    setEnabled(enabled: boolean): void {
        const breakpoints = this.breakpoints.getDataBreakpoints();
        const breakpoint = breakpoints.find(b => b.id === this.id);
        if (breakpoint && breakpoint.enabled !== enabled) {
            breakpoint.enabled = enabled;
            this.breakpoints.setDataBreakpoints(breakpoints);
        }
    }

    protected override isEnabled(): boolean {
        return super.isEnabled() && this.isSupported();
    }

    protected isSupported(): boolean {
        const { session } = this;
        return !session || !!session.capabilities.supportsDataBreakpoints;
    }

    remove(): void {
        const breakpoints = this.breakpoints.getDataBreakpoints();
        const newBreakpoints = breakpoints.filter(b => b.id !== this.id);
        if (breakpoints.length !== newBreakpoints.length) {
            this.breakpoints.setDataBreakpoints(newBreakpoints);
        }
    }

    get name(): string {
        return this.origin.raw.dataId;
    }

    protected doRender(): React.ReactNode {
        let desc: string = '';
        if (this.origin.raw.condition) {
            desc += ` [condition: ${this.origin.raw.condition}]`;
        }
        if (this.origin.raw.hitCondition) {
            desc += ` [hitCondition: ${this.origin.raw.hitCondition}]`;
        }
        return <React.Fragment>
            <span className='line-info' title={this.name}>
                <span className='name'>{this.name} </span>
                <span className={'path line ' + TREE_NODE_INFO_CLASS}>{(this.origin.raw.accessType)}</span>
                {desc}
            </span>
            <span className='line'>{'DataBreakpoint'}</span>
        </React.Fragment>;
    }

    protected override doGetDecoration(): DebugBreakpointDecoration {
        if (!this.isSupported()) {
            return this.getDisabledBreakpointDecoration(nls.localizeByDefault('Data breakpoints are not supported by this debug type'));
        }
        return super.doGetDecoration();
    }

    protected getBreakpointDecoration(message?: string[]): DebugBreakpointDecoration {
        return {
            className: 'codicon-debug-breakpoint-data',
            message: message || [nls.localizeByDefault('Data Breakpoint')]
        };
    }

    async checkDataBreakpointInfo(): Promise<void> {
        const breakpoints = this.breakpoints.getDataBreakpoints();
        const breakpoint = breakpoints.find(b => b.id === this.id);
        if (breakpoint) {
            // if (breakpoint.raw.dataId !== this.name) {
            //     breakpoint.raw.dataId = this.name;
            this.breakpoints.setDataBreakpoints(breakpoints);
            // }
        } else {
            breakpoints.push(this.origin);
            this.breakpoints.setDataBreakpoints(breakpoints);
        }
    }

}
