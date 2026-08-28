import {describe,expect,it} from "vitest";
import {defaultWorkspace,parseWorkspace,workspaceLanding} from "./workspace-settings";
describe("workspace settings",()=>{it("uses coherent defaults",()=>{expect(parseWorkspace(null)).toEqual(defaultWorkspace)});it("filters unknown modules",()=>{expect(parseWorkspace({modules:["guests","unknown"]}).modules).toEqual(["guests"])});it("resolves the selected landing page",()=>{expect(workspaceLanding({...defaultWorkspace,landing:"rsvp"})).toBe("/dashboard/rsvp")})});
