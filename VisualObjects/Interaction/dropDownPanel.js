
class DropDownMenu extends TextObject
{
    static #content_obj = null;
    static #drop_down_item_press_any(source)
    {
        for(const child of source.parent.children) child.state.is_shown = false;
        console.log(`${source.parent.name}:${source.name}`);
        DropDownMenu.#content_obj = null;
    }

    static #drop_down_item_focus_lost(source) 
    {
        if (source.parent.state.on_focus) return;
        for(const child of source.parent.children) if(child.state.on_focus) return;
        for(const child of source.parent.children) child.state.is_shown = false;
        DropDownMenu.#content_obj = null;
    }

    static #drop_down_show_content(source) 
    {
        if (DropDownMenu.#content_obj !== null)
        {
            for(const child of DropDownMenu.#content_obj.children) child.state.is_shown = false;
        }
        for(const child of source.children) child.state.is_shown = true;
        DropDownMenu.#content_obj = source;
    }
    static #drop_down_show_content_on_focus(source) 
    {
        if (DropDownMenu.#content_obj === null) return;
        if (DropDownMenu.#content_obj === source) return;
        for(const child of DropDownMenu.#content_obj.children) child.state.is_shown = false;
        for(const child of source.children) child.state.is_shown = true;
        DropDownMenu.#content_obj = source;
    }
    #last_item;
    constructor(position=null, size=null, parent=null)
    {
        size = size == null? new Vector2d(155, 45): size;
        super(new Vector2d(position.x - size.x * 0.5, position.y - size.y * 0.5),
              new Vector2d(position.x + size.x * 0.5, position.y + size.y * 0.5));
        this.#last_item = null;
        if(parent!==null) this.parent = parent;
        this.transform. freeze  = true;
        this.state.is_moveable  = false;
        this.visual     = MAIN_MENU_VISUAL_SETTINGS;
        this.on_begin_press_callback_append(DropDownMenu.#drop_down_show_content);
        this.on_begin_focus_callback_append(DropDownMenu.#drop_down_show_content_on_focus);
    }
    add_button(name = null)
    {
        // const position = this.transform.position;
        const shape    = this.bounds.shape;
        const shift    = (1.0 + this.children_count) * shape. y; 
        const button   = new TextObject(
            new Vector2d(- shape.x * 0.5, shift - shape.y * 0.5),
            new Vector2d(+ shape.x * 0.5, shift + shape.y * 0.5), name);
        button.parent = this;
        button.name = name == null ? `${this.name}:${name}(${this.children_count})$`: name;
        button.state.is_shown = false;
        button.on_end_focus_callback_append  (DropDownMenu.#drop_down_item_focus_lost);
        button.on_end_press_callback_append  (DropDownMenu.#drop_down_item_press_any);
        // if(this.#last_item!=null)this.#last_item.visual = MAIN_MENU_VISUAL_SETTINGS;
        // this.#last_item = button;
        button.visual = MAIN_MENU_BUTTON_VISUAL_SETTINGS;
        return button;
    }
}